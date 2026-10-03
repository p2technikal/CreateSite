const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const localTime = document.querySelector("#local-time");
const currentYear = document.querySelector("#current-year");
const savedTheme = window.localStorage.getItem("theme");

if (savedTheme === "light" || savedTheme === "dark") {
  root.dataset.theme = savedTheme;
}

function updateThemeLabel() {
  const isLight = root.dataset.theme === "light";
  themeToggle.setAttribute(
    "aria-label",
    isLight ? "Switch to dark theme" : "Switch to light theme",
  );
}

function updateLocalTime() {
  const now = new Date();
  const time = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Melbourne",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(now);

  localTime.dateTime = now.toISOString();
  localTime.textContent = time + " in Melbourne";
}

themeToggle.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = nextTheme;
  window.localStorage.setItem("theme", nextTheme);
  updateThemeLabel();
});

currentYear.textContent = new Date().getFullYear();
updateThemeLabel();
updateLocalTime();
window.setInterval(updateLocalTime, 60_000);
