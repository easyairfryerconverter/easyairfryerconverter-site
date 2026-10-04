const root = document.documentElement;
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const savedTheme = localStorage.getItem("theme");
const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
root.dataset.theme = savedTheme || (systemDark ? "dark" : "light");

const themeBtn = document.getElementById("themeToggle");
function syncThemeButton(){
  if (!themeBtn) return;
  const dark = root.dataset.theme === "dark";
  themeBtn.textContent = dark ? "☀️" : "🌙";
  themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
}
syncThemeButton();

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", root.dataset.theme);
    syncThemeButton();
  });
}

const mobileBtn = document.getElementById("mobileMenuBtn");
const mobileMenu = document.getElementById("mobileMenu");
if (mobileBtn && mobileMenu) {
  mobileBtn.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    mobileBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

let preferredUnit = localStorage.getItem("tempUnit") || "F";
const unitToggle = document.getElementById("unitToggle");

function syncUnitToggle(){
  if (unitToggle) unitToggle.textContent = preferredUnit === "F" ? "°F" : "°C";
  document.querySelectorAll("[data-f][data-c]").forEach(el => {
    el.textContent = preferredUnit === "F" ? el.dataset.f : el.dataset.c;
  });
  const converterUnit = document.getElementById("unit");
  if (converterUnit) converterUnit.value = preferredUnit;
}
syncUnitToggle();

if (unitToggle) {
  unitToggle.addEventListener("click", () => {
    preferredUnit = preferredUnit === "F" ? "C" : "F";
    localStorage.setItem("tempUnit", preferredUnit);
    syncUnitToggle();
  });
}

const converterUnit = document.getElementById("unit");
if (converterUnit) {
  converterUnit.addEventListener("change", () => {
    preferredUnit = converterUnit.value;
    localStorage.setItem("tempUnit", preferredUnit);
    syncUnitToggle();
  });
}

const convertBtn = document.getElementById("convertBtn");
if (convertBtn) {
  const temp = document.getElementById("temp");
  const unit = document.getElementById("unit");
  const minutes = document.getElementById("minutes");
  const rounding = document.getElementById("rounding");
  const result = document.getElementById("result");
  const resultMain = document.getElementById("resultMain");
  const resultNote = document.getElementById("resultNote");

  function roundTo(value, step){ return Math.round(value / step) * step; }

  convertBtn.addEventListener("click", () => {
    const t = Number(temp.value), m = Number(minutes.value), r = Number(rounding.value);
    if (!t || !m || t <= 0 || m <= 0) {
      result.style.display = "block";
      resultMain.textContent = "Please enter valid numbers.";
      resultNote.textContent = "";
      return;
    }
    let airTemp = unit.value === "F" ? t - 25 : t - 15;
    airTemp = roundTo(airTemp, r);
    const airMinutes = Math.max(1, Math.round(m * 0.8));
    const checkAt = Math.max(1, Math.round(airMinutes * 0.8));
    resultMain.textContent = `${airTemp}°${unit.value} for about ${airMinutes} minutes`;
    resultNote.textContent = `Start checking around ${checkAt} minutes. Exact results vary by food, quantity, and air fryer model.`;
    result.style.display = "block";
  });
}