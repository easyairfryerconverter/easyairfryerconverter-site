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


// Microwave -> Air Fryer helper.
// This is intentionally food-aware rather than a fake one-size-fits-all formula.
const microwaveConvertBtn = document.getElementById("microwaveConvertBtn");
if (microwaveConvertBtn) {
  const mwMinutes = document.getElementById("mwMinutes");
  const mwSeconds = document.getElementById("mwSeconds");
  const foodType = document.getElementById("foodType");
  const foodState = document.getElementById("foodState");
  const desiredResult = document.getElementById("desiredResult");
  const mwResult = document.getElementById("mwResult");
  const mwResultMain = document.getElementById("mwResultMain");
  const mwResultNote = document.getElementById("mwResultNote");

  const presets = {
    "nuggets": {f:390,c:200,min:6,max:10,action:"Shake halfway"},
    "fries": {f:390,c:200,min:12,max:18,action:"Shake halfway"},
    "pizza": {f:350,c:175,min:4,max:8,action:"Check early"},
    "leftovers": {f:350,c:175,min:5,max:10,action:"Turn or stir if practical"},
    "vegetables": {f:375,c:190,min:7,max:12,action:"Shake halfway"},
    "chicken": {f:360,c:180,min:10,max:18,action:"Turn halfway; verify safe internal temperature"},
    "fish": {f:360,c:180,min:8,max:14,action:"Check for doneness early"},
    "other": {f:360,c:180,min:6,max:12,action:"Check early and adjust"}
  };

  microwaveConvertBtn.addEventListener("click", () => {
    const mins = Number(mwMinutes.value || 0);
    const secs = Number(mwSeconds.value || 0);
    const totalMw = mins + secs / 60;

    if (totalMw <= 0) {
      mwResult.style.display = "block";
      mwResultMain.textContent = "Enter the microwave cooking time.";
      mwResultNote.textContent = "";
      return;
    }

    const p = presets[foodType.value] || presets.other;
    let min = p.min, max = p.max;

    if (foodState.value === "frozen") {
      min += 1; max += 2;
    } else if (foodState.value === "room") {
      min = Math.max(2, min - 1); max = Math.max(min + 1, max - 1);
    }

    if (desiredResult.value === "crisp") {
      max += 2;
    } else if (desiredResult.value === "reheat") {
      max = Math.max(min + 1, max - 1);
    }

    // Use microwave time only as a gentle scaling hint, never as a direct formula.
    const factor = Math.min(1.35, Math.max(0.8, 0.85 + totalMw * 0.05));
    min = Math.max(2, Math.round(min * factor));
    max = Math.max(min + 1, Math.round(max * factor));

    const tempText = preferredUnit === "C" ? `${p.c}°C` : `${p.f}°F`;
    mwResult.style.display = "block";
    mwResultMain.textContent = `${tempText} for about ${min}–${max} minutes`;
    mwResultNote.textContent =
      `${p.action}. Microwave-to-air-fryer conversion is not exact because the appliances cook differently; use this as a starting range and check food early.`;
  });
}

// Air Fryer -> Microwave helper.
const reverseConvertBtn = document.getElementById("reverseConvertBtn");
if (reverseConvertBtn) {
  const afMinutes = document.getElementById("afMinutes");
  const reverseFood = document.getElementById("reverseFood");
  const reverseResult = document.getElementById("reverseResult");
  const reverseResultMain = document.getElementById("reverseResultMain");
  const reverseResultNote = document.getElementById("reverseResultNote");

  reverseConvertBtn.addEventListener("click", () => {
    const mins = Number(afMinutes.value || 0);
    if (mins <= 0) {
      reverseResult.style.display = "block";
      reverseResultMain.textContent = "Enter the air fryer cooking time.";
      reverseResultNote.textContent = "";
      return;
    }

    const ratios = {
      "leftovers": 0.30,
      "vegetables": 0.28,
      "pizza": 0.25,
      "nuggets": 0.30,
      "chicken": 0.35,
      "fish": 0.32,
      "other": 0.30
    };
    const ratio = ratios[reverseFood.value] || 0.30;
    const approx = Math.max(1, Math.round(mins * ratio * 2) / 2);

    reverseResult.style.display = "block";
    reverseResultMain.textContent = `Start around ${approx} minutes in the microwave`;
    reverseResultNote.textContent =
      "Microwaves heat rather than crisp, so texture will be different. Use short intervals, stir/turn when possible, and verify safe doneness for meat and poultry.";
  });
}
