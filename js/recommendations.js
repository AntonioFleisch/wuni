const CHANCE_META = {
  alta: { emoji: "🟢", label: "Alta chance", tagClass: "tag-green", pillClass: "pill-green" },
  media: { emoji: "🟡", label: "Chance intermediária", tagClass: "tag-yellow", pillClass: "pill-yellow" },
  baixa: { emoji: "🔴", label: "Baixa chance", tagClass: "tag-red", pillClass: "pill-red" }
};

function calculateFit(course, profile) {
  const interesses = profile.interesses || [];
  const courseMatch = interesses.length === 0 ? 0.6 : interesses.includes(course.curso) ? 1 : 0.25;

  let budgetFit;
  if (course.mensalidade === 0) {
    budgetFit = 1;
  } else if (course.mensalidade <= profile.orcamentoMensal) {
    const slack = profile.orcamentoMensal > 0 ? course.mensalidade / profile.orcamentoMensal : 1;
    budgetFit = Math.max(0.7, 1 - slack * 0.3);
  } else {
    const over = (course.mensalidade - profile.orcamentoMensal) / Math.max(profile.orcamentoMensal, 1);
    budgetFit = Math.max(0, 1 - over);
  }

  const cidadesAceita = profile.cidadesAceita || [];
  const locationFit =
    profile.aceitaMorarFora || cidadesAceita.length === 0
      ? 1
      : cidadesAceita.includes(course.cidade)
      ? 1
      : 0.3;

  const modalidadePref = profile.modalidade || [];
  const modalidadeFit =
    modalidadePref.length === 0 ? 1 : modalidadePref.includes(course.modalidade) ? 1 : 0.2;

  const turnoPref = profile.turno || [];
  const turnoFit =
    turnoPref.length === 0 ? 1 : course.turnos.some((t) => turnoPref.includes(t)) ? 1 : 0.3;

  const qualityFit = course.notaMEC / 5;

  const media = enemMedia(profile.enem || {});
  const ratio = course.notaCorte > 0 ? media / course.notaCorte : 1;
  const academicFit = Math.min(1, Math.max(0, (ratio - 0.7) / 0.5));

  const weighted =
    courseMatch * 0.3 +
    budgetFit * 0.15 +
    locationFit * 0.1 +
    modalidadeFit * 0.1 +
    turnoFit * 0.05 +
    qualityFit * 0.15 +
    academicFit * 0.15;

  return Math.round(weighted * 100);
}

function calculateChance(course, profile) {
  const media = enemMedia(profile.enem || {});
  if (!course.notaCorte) return "alta";
  const ratio = media / course.notaCorte;
  if (ratio >= 1.05) return "alta";
  if (ratio >= 0.93) return "media";
  return "baixa";
}

function formatMoney(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function renderCard(course, profile) {
  const fit = calculateFit(course, profile);
  const chance = calculateChance(course, profile);
  const meta = CHANCE_META[chance];

  const card = document.createElement("article");
  card.className = "rec-card";

  const main = document.createElement("div");
  main.className = "rec-card-main";

  const badges = document.createElement("div");
  badges.className = "rec-card-badges";
  badges.innerHTML = `
    <span class="badge ${course.tipo === "publica" ? "badge-public" : "badge-private"}">${course.tipo === "publica" ? "Pública" : "Privada"}</span>
    <span class="tag ${meta.tagClass}">${meta.emoji} ${meta.label}</span>
    ${course.bolsas ? '<span class="badge badge-scholarship">Bolsas disponíveis</span>' : ""}
    <span class="badge badge-mec">MEC: ${course.situacaoMEC === "regular" ? "Regular" : "Em avaliação"}</span>
  `;
  main.appendChild(badges);

  const h3 = document.createElement("h3");
  h3.textContent = course.curso;
  main.appendChild(h3);

  const inst = document.createElement("p");
  inst.className = "rec-institution";
  inst.textContent = course.instituicao;
  main.appendChild(inst);

  const loc = document.createElement("p");
  loc.className = "rec-location";
  loc.textContent = `${course.cidade}/${course.estado} · ${CUSTO_VIDA_LABELS[course.custoVidaCidade]}`;
  main.appendChild(loc);

  const stats = document.createElement("div");
  stats.className = "rec-stats";
  stats.innerHTML = `
    <div class="rec-stat"><span>Mensalidade</span><b>${course.mensalidade === 0 ? "Gratuita" : formatMoney(course.mensalidade)}</b></div>
    <div class="rec-stat"><span>Duração</span><b>${course.duracaoSemestres / 2} anos</b></div>
    <div class="rec-stat"><span>Nota MEC</span><b>${course.notaMEC.toFixed(1)}/5</b></div>
    <div class="rec-stat"><span>Taxa de evasão</span><b>${course.taxaEvasao}%</b></div>
    <div class="rec-stat"><span>Nota de corte</span><b>${course.notaCorte}</b></div>
    <div class="rec-stat"><span>Salário médio egressos</span><b>${formatMoney(course.salarioMedioEgressos)}</b></div>
  `;
  main.appendChild(stats);

  const chipRows = document.createElement("div");
  chipRows.className = "rec-chip-rows";

  const turnoRow = document.createElement("div");
  turnoRow.className = "rec-chip-row";
  turnoRow.innerHTML =
    `<span class="label">Turnos</span>` +
    course.turnos.map((t) => `<span class="rec-mini-chip">${TURNO_LABELS[t] || t}</span>`).join("");
  chipRows.appendChild(turnoRow);

  const ingressoRow = document.createElement("div");
  ingressoRow.className = "rec-chip-row";
  ingressoRow.innerHTML =
    `<span class="label">Ingresso</span>` +
    course.ingresso.map((i) => `<span class="rec-mini-chip">${INGRESSO_LABELS[i] || i}</span>`).join("");
  chipRows.appendChild(ingressoRow);

  const modalidadeRow = document.createElement("div");
  modalidadeRow.className = "rec-chip-row";
  const modalidadeLabel = course.modalidade === "EAD" ? "EAD" : course.modalidade === "hibrido" ? "Híbrido" : "Presencial";
  modalidadeRow.innerHTML = `<span class="label">Modalidade</span><span class="rec-mini-chip">${modalidadeLabel}</span>`;
  chipRows.appendChild(modalidadeRow);

  main.appendChild(chipRows);
  card.appendChild(main);

  const side = document.createElement("div");
  side.className = "rec-card-side";
  side.innerHTML = `
    <div class="rec-fitscore">
      <b>${fit}</b>
      <span>Fit Score</span>
    </div>
  `;
  card.appendChild(side);

  return card;
}

function readFilters() {
  return {
    search: document.getElementById("search-input").value.trim().toLowerCase(),
    tipo: getChipSelectValues(document.getElementById("filter-tipo")),
    modalidade: getChipSelectValues(document.getElementById("filter-modalidade")),
    turno: getChipSelectValues(document.getElementById("filter-turno")),
    ingresso: getChipSelectValues(document.getElementById("filter-ingresso")),
    mensalidadeMax: Number(document.getElementById("filter-mensalidade").value),
    mecMin: Number(document.getElementById("filter-mec").value),
    somenteBolsas: document.getElementById("filter-bolsas").checked,
    somenteRegular: document.getElementById("filter-regular").checked,
    sort: document.getElementById("sort-select").value
  };
}

function courseMatchesFilters(course, filters) {
  if (filters.search) {
    const haystack = `${course.curso} ${course.instituicao} ${course.cidade}`.toLowerCase();
    if (!haystack.includes(filters.search)) return false;
  }
  if (filters.tipo.length && !filters.tipo.includes(course.tipo)) return false;
  if (filters.modalidade.length && !filters.modalidade.includes(course.modalidade)) return false;
  if (filters.turno.length && !course.turnos.some((t) => filters.turno.includes(t))) return false;
  if (filters.ingresso.length && !course.ingresso.some((i) => filters.ingresso.includes(i))) return false;
  if (course.mensalidade > 0 && course.mensalidade > filters.mensalidadeMax) return false;
  if (course.notaMEC < filters.mecMin) return false;
  if (filters.somenteBolsas && !course.bolsas) return false;
  if (filters.somenteRegular && course.situacaoMEC !== "regular") return false;
  return true;
}

function sortCourses(list, sort, profile) {
  const withScores = list.map((course) => ({
    course,
    fit: calculateFit(course, profile)
  }));

  withScores.sort((a, b) => {
    switch (sort) {
      case "mensalidade":
        return (a.course.mensalidade || 0) - (b.course.mensalidade || 0);
      case "mec":
        return b.course.notaMEC - a.course.notaMEC;
      case "evasao":
        return a.course.taxaEvasao - b.course.taxaEvasao;
      case "salario":
        return b.course.salarioMedioEgressos - a.course.salarioMedioEgressos;
      default:
        return b.fit - a.fit;
    }
  });

  return withScores.map((w) => w.course);
}

function renderSummary(filtered, profile) {
  const counts = { alta: 0, media: 0, baixa: 0 };
  filtered.forEach((course) => {
    counts[calculateChance(course, profile)] += 1;
  });

  const strip = document.getElementById("summary-strip");
  strip.innerHTML = `
    <div class="summary-pill pill-red">
      <b>${counts.baixa}</b>
      <span>🎯 Faculdades dos sonhos</span>
    </div>
    <div class="summary-pill pill-yellow">
      <b>${counts.media}</b>
      <span>⭐ Faculdades-alvo</span>
    </div>
    <div class="summary-pill pill-green">
      <b>${counts.alta}</b>
      <span>✅ Opções seguras</span>
    </div>
  `;
}

function renderResults() {
  const profile = getProfile();
  const filters = readFilters();

  document.getElementById("mensalidade-value").textContent =
    filters.mensalidadeMax >= 10000 ? "Sem limite" : formatMoney(filters.mensalidadeMax);
  document.getElementById("mec-value").textContent = filters.mecMin.toFixed(1);

  const filtered = sortCourses(COURSES.filter((c) => courseMatchesFilters(c, filters)), filters.sort, profile);

  document.getElementById("results-count").innerHTML = `<strong>${filtered.length}</strong> opções encontradas`;
  renderSummary(filtered, profile);

  const grid = document.getElementById("rec-grid");
  grid.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Nenhuma opção encontrada com esses filtros. Tente ampliar a mensalidade máxima ou remover algum filtro.";
    grid.appendChild(empty);
    return;
  }

  filtered.forEach((course) => grid.appendChild(renderCard(course, profile)));
}

document.addEventListener("DOMContentLoaded", () => {
  const profile = getProfile();

  if (profile.nome) {
    document.getElementById("page-title").textContent = `Recomendações para ${profile.nome}`;
  }
  if (profile.interesses && profile.interesses.length) {
    document.getElementById("page-subtitle").textContent =
      `Baseado no seu perfil (interesse em ${profile.interesses.join(", ")}). Ajuste os filtros abaixo para explorar outras opções.`;
  }

  ["filter-tipo", "filter-modalidade", "filter-turno", "filter-ingresso"].forEach((id) => {
    wireChipToggle(document.getElementById(id));
    document.getElementById(id).addEventListener("click", renderResults);
  });

  document.getElementById("search-input").addEventListener("input", renderResults);
  document.getElementById("filter-mensalidade").addEventListener("input", renderResults);
  document.getElementById("filter-mec").addEventListener("input", renderResults);
  document.getElementById("filter-bolsas").addEventListener("change", renderResults);
  document.getElementById("filter-regular").addEventListener("change", renderResults);
  document.getElementById("sort-select").addEventListener("change", renderResults);

  document.getElementById("clear-filters").addEventListener("click", () => {
    document.getElementById("search-input").value = "";
    ["filter-tipo", "filter-modalidade", "filter-turno", "filter-ingresso"].forEach((id) => {
      document.getElementById(id).querySelectorAll(".chip-toggle.active").forEach((b) => b.classList.remove("active"));
    });
    document.getElementById("filter-mensalidade").value = 10000;
    document.getElementById("filter-mec").value = 1;
    document.getElementById("filter-bolsas").checked = false;
    document.getElementById("filter-regular").checked = false;
    renderResults();
  });

  renderResults();
});
