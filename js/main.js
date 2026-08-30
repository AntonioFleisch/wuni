document.getElementById("year").textContent = new Date().getFullYear();

const THEME_KEY = "wuni-theme";
const themeToggle = document.getElementById("theme-toggle");

if (themeToggle) {
  const systemPrefersDark = () =>
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  let currentTheme;
  try {
    currentTheme = localStorage.getItem(THEME_KEY);
  } catch (e) {
    currentTheme = null;
  }
  if (currentTheme !== "light" && currentTheme !== "dark") {
    currentTheme = systemPrefersDark() ? "dark" : "light";
  }
  document.documentElement.setAttribute("data-theme", currentTheme);
  themeToggle.setAttribute("aria-pressed", String(currentTheme === "dark"));

  themeToggle.addEventListener("click", () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", currentTheme);
    themeToggle.setAttribute("aria-pressed", String(currentTheme === "dark"));
    try {
      localStorage.setItem(THEME_KEY, currentTheme);
    } catch (e) {}
  });
}

const navToggle = document.getElementById("nav-toggle");
const mainNav = document.getElementById("main-nav");

navToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

const revealTargets = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealTargets.forEach((el) => observer.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add("is-visible"));
}
