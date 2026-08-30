function wireChipToggle(container) {
  container.querySelectorAll(".chip-toggle").forEach((btn) => {
    btn.addEventListener("click", () => btn.classList.toggle("active"));
  });
}

function buildChipSelect(container, options, selected) {
  container.innerHTML = "";
  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip-toggle" + (selected.includes(opt) ? " active" : "");
    btn.dataset.value = opt;
    btn.textContent = opt;
    container.appendChild(btn);
  });
  wireChipToggle(container);
}

function setChipSelectActive(container, values) {
  container.querySelectorAll(".chip-toggle").forEach((btn) => {
    btn.classList.toggle("active", values.includes(btn.dataset.value));
  });
}

function getChipSelectValues(container) {
  return [...container.querySelectorAll(".chip-toggle.active")].map((b) => b.dataset.value);
}
