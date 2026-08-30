function setupQuiz(interessesContainer) {
  const modal = document.getElementById("quiz-modal");
  const openBtn = document.getElementById("open-quiz");
  const closeBtn = document.getElementById("close-quiz");
  const quizBody = document.getElementById("quiz-body");
  const quizResult = document.getElementById("quiz-result");
  const quizSubmit = document.getElementById("quiz-submit");

  function renderQuestions() {
    quizBody.hidden = false;
    quizResult.hidden = true;
    quizSubmit.hidden = false;
    quizSubmit.textContent = "Ver resultado";
    quizBody.innerHTML = "";

    QUIZ_QUESTIONS.forEach((q, qi) => {
      const wrap = document.createElement("div");
      wrap.className = "quiz-question";

      const p = document.createElement("p");
      p.textContent = `${qi + 1}. ${q.text}`;
      wrap.appendChild(p);

      const optsWrap = document.createElement("div");
      optsWrap.className = "quiz-options";

      q.options.forEach((opt) => {
        const label = document.createElement("label");
        label.className = "quiz-option";

        const input = document.createElement("input");
        input.type = "radio";
        input.name = `q${qi}`;
        input.value = opt.area;
        input.addEventListener("change", () => {
          optsWrap.querySelectorAll(".quiz-option").forEach((el) => el.classList.remove("is-checked"));
          label.classList.add("is-checked");
        });

        label.appendChild(input);
        label.append(opt.text);
        optsWrap.appendChild(label);
      });

      wrap.appendChild(optsWrap);
      quizBody.appendChild(wrap);
    });
  }

  function renderResult(topAreas) {
    quizBody.hidden = true;
    quizResult.hidden = false;
    quizSubmit.hidden = true;
    quizResult.innerHTML = "";

    const intro = document.createElement("p");
    intro.textContent = "Com base nas suas respostas, essas são as áreas que mais combinam com você:";
    quizResult.appendChild(intro);

    const areasWrap = document.createElement("div");
    areasWrap.className = "quiz-result-areas";

    topAreas.forEach((areaKey) => {
      const info = AREA_INFO[areaKey];
      const card = document.createElement("div");
      card.className = "quiz-result-card";

      const h3 = document.createElement("h3");
      h3.textContent = info.label;
      card.appendChild(h3);

      const p = document.createElement("p");
      p.style.margin = "0";
      p.style.fontSize = "0.86rem";
      p.textContent = "Cursos que costumam combinar com essa área:";
      card.appendChild(p);

      const chips = document.createElement("div");
      chips.className = "chip-select";
      info.cursos.forEach((curso) => {
        const span = document.createElement("span");
        span.className = "rec-mini-chip";
        span.textContent = curso;
        chips.appendChild(span);
      });
      card.appendChild(chips);

      areasWrap.appendChild(card);
    });
    quizResult.appendChild(areasWrap);

    const actions = document.createElement("div");
    actions.className = "form-actions";

    const applyBtn = document.createElement("button");
    applyBtn.type = "button";
    applyBtn.className = "btn btn-primary btn-sm";
    applyBtn.textContent = "Usar esses cursos no meu perfil";
    applyBtn.addEventListener("click", () => {
      const cursosSugeridos = topAreas
        .flatMap((a) => AREA_INFO[a].cursos)
        .filter((c) => CURSOS_DISPONIVEIS.includes(c));
      const atuais = getChipSelectValues(interessesContainer);
      const merged = [...new Set([...atuais, ...cursosSugeridos])];
      buildChipSelect(interessesContainer, CURSOS_DISPONIVEIS, merged);
      modal.classList.remove("is-open");
    });

    const redoBtn = document.createElement("button");
    redoBtn.type = "button";
    redoBtn.className = "btn btn-ghost btn-sm";
    redoBtn.textContent = "Refazer teste";
    redoBtn.addEventListener("click", renderQuestions);

    actions.appendChild(applyBtn);
    actions.appendChild(redoBtn);
    quizResult.appendChild(actions);
  }

  openBtn.addEventListener("click", () => {
    renderQuestions();
    modal.classList.add("is-open");
  });

  closeBtn.addEventListener("click", () => modal.classList.remove("is-open"));
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.classList.remove("is-open");
  });

  quizSubmit.addEventListener("click", () => {
    const scores = { exatas: 0, negocios: 0, humanas: 0, saude: 0, artes: 0 };
    let answered = 0;

    QUIZ_QUESTIONS.forEach((q, qi) => {
      const checked = quizBody.querySelector(`input[name="q${qi}"]:checked`);
      if (checked) {
        scores[checked.value] += 1;
        answered += 1;
      }
    });

    if (answered === 0) {
      alert("Responda pelo menos uma pergunta para ver o resultado.");
      return;
    }

    const ranked = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .filter(([, v]) => v > 0)
      .map(([area]) => area);

    renderResult(ranked.slice(0, 2));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const profile = getProfile();

  document.getElementById("nome").value = profile.nome || "";
  document.getElementById("anoEscola").value = profile.anoEscola || "3º ano";
  document.getElementById("escolaPublica").checked = !!profile.escolaPublica;

  document.getElementById("enem-linguagens").value = profile.enem?.linguagens ?? "";
  document.getElementById("enem-humanas").value = profile.enem?.humanas ?? "";
  document.getElementById("enem-natureza").value = profile.enem?.natureza ?? "";
  document.getElementById("enem-matematica").value = profile.enem?.matematica ?? "";
  document.getElementById("enem-redacao").value = profile.enem?.redacao ?? "";
  document.getElementById("mediaHistorico").value = profile.mediaHistorico ?? "";

  document.getElementById("rendaPerCapita").value = profile.rendaPerCapita || "de-1-a-2-sm";
  document.getElementById("orcamentoMensal").value = profile.orcamentoMensal ?? "";

  document.getElementById("ppi").checked = !!profile.ppi;
  document.getElementById("pcd").checked = !!profile.pcd;

  const interessesContainer = document.getElementById("interesses-select");
  buildChipSelect(interessesContainer, CURSOS_DISPONIVEIS, profile.interesses || []);

  const cidadesContainer = document.getElementById("cidades-select");
  buildChipSelect(cidadesContainer, CIDADES_DISPONIVEIS, profile.cidadesAceita || []);

  document.getElementById("aceitaMorarFora").checked = !!profile.aceitaMorarFora;

  const turnoContainer = document.getElementById("turno-select");
  setChipSelectActive(turnoContainer, profile.turno || []);
  wireChipToggle(turnoContainer);

  const modalidadeContainer = document.getElementById("modalidade-select");
  setChipSelectActive(modalidadeContainer, profile.modalidade || []);
  wireChipToggle(modalidadeContainer);

  setupQuiz(interessesContainer);

  document.getElementById("profile-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const newProfile = {
      nome: document.getElementById("nome").value.trim(),
      anoEscola: document.getElementById("anoEscola").value,
      escolaPublica: document.getElementById("escolaPublica").checked,
      enem: {
        linguagens: Number(document.getElementById("enem-linguagens").value) || 0,
        humanas: Number(document.getElementById("enem-humanas").value) || 0,
        natureza: Number(document.getElementById("enem-natureza").value) || 0,
        matematica: Number(document.getElementById("enem-matematica").value) || 0,
        redacao: Number(document.getElementById("enem-redacao").value) || 0
      },
      mediaHistorico: document.getElementById("mediaHistorico").value
        ? Number(document.getElementById("mediaHistorico").value)
        : null,
      rendaPerCapita: document.getElementById("rendaPerCapita").value,
      orcamentoMensal: Number(document.getElementById("orcamentoMensal").value) || 0,
      ppi: document.getElementById("ppi").checked,
      pcd: document.getElementById("pcd").checked,
      interesses: getChipSelectValues(interessesContainer),
      cidadesAceita: getChipSelectValues(cidadesContainer),
      aceitaMorarFora: document.getElementById("aceitaMorarFora").checked,
      turno: getChipSelectValues(turnoContainer),
      modalidade: getChipSelectValues(modalidadeContainer)
    };

    saveProfile(newProfile);

    const feedback = document.getElementById("save-feedback");
    feedback.textContent = "Perfil salvo! Suas recomendações já foram atualizadas.";
    setTimeout(() => {
      feedback.textContent = "";
    }, 4000);
  });
});
