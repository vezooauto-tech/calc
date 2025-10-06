// === ВНУТРЕННИЙ КАЛЬКУЛЯТОР АВТО (Беларусь) ===

// --- Элементы ---
const rateUSDCNY = document.getElementById("rateUSDCNY");
const rateUSDKRW = document.getElementById("rateUSDKRW");
const rateUSDEUR = document.getElementById("rateUSDEUR");

const priceInput = document.getElementById("price");
const currencyLabel = document.getElementById("currencyLabel");
const ageSelect = document.getElementById("age");
const engineTypeSelect = document.getElementById("engineType");
const volumeInput = document.getElementById("volume");
const benefitCheckbox = document.getElementById("benefit140");
const deliveryInput = document.getElementById("delivery");
const clientPriceInput = document.getElementById("clientPrice");

const btnChina = document.getElementById("btnChina");
const btnKorea = document.getElementById("btnKorea");
const btnCalc = document.getElementById("btnCalc");
const btnClear = document.getElementById("btnClear");
const btnSend = document.getElementById("btnSend");

// Вывод
const outDate = document.getElementById("outDate");
const outPriceUSD = document.getElementById("outPriceUSD");
const outPriceEUR = document.getElementById("outPriceEUR");
const outDutyUSD = document.getElementById("outDutyUSD");
const outDutyEUR = document.getElementById("outDutyEUR");
const outDeliveryUSD = document.getElementById("outDeliveryUSD");
const outTotalNoMargin = document.getElementById("outTotalNoMargin");
const outMargin = document.getElementById("outMargin");
const outCommission = document.getElementById("outCommission");
const outUtilUSD = document.getElementById("outUtilUSD");
const outCustomsUSD = document.getElementById("outCustomsUSD");
const outSVHUSD = document.getElementById("outSVHUSD");
const outBrokerUSD = document.getElementById("outBrokerUSD");
const outFullUSD = document.getElementById("outFullUSD");

// Дополнительные данные
const brandModel = document.getElementById("brandModel");
const yearInput = document.getElementById("year");
const mileageInput = document.getElementById("mileage");
const linkInput = document.getElementById("link");
const commentInput = document.getElementById("comment");

// --- Переменные ---
let currentCountry = "china";

// --- Обработчики выбора страны ---
btnChina.addEventListener("click", () => setCountry("china"));
btnKorea.addEventListener("click", () => setCountry("korea"));

function setCountry(country) {
  currentCountry = country;
  btnChina.classList.toggle("active", country === "china");
  btnKorea.classList.toggle("active", country === "korea");
  currencyLabel.textContent = country === "china" ? "юань" : "вон";
  deliveryInput.value = country === "china" ? 4460 : 4370;
}

// --- Точная формула расчёта пошлины ---
function calcDuty(ageYears, volumeCC, priceEUR) {
  let duty = 0;

  if (ageYears <= 3) {
    const rules = [
      { min: 0, max: 8500, percent: 0.54, minRate: 2.5 },
      { min: 8500, max: 16700, percent: 0.48, minRate: 3.5 },
      { min: 16700, max: 42300, percent: 0.48, minRate: 5.5 },
      { min: 42300, max: 84500, percent: 0.48, minRate: 7.5 },
      { min: 84500, max: 169000, percent: 0.48, minRate: 15 },
      { min: 169000, max: Infinity, percent: 0.48, minRate: 20 }
    ];
    const rule = rules.find(r => priceEUR >= r.min && priceEUR < r.max);
    const percentDuty = rule.percent * priceEUR;
    const volumeDuty = rule.minRate * volumeCC;
    duty = Math.max(percentDuty, volumeDuty);
  } else if (ageYears > 3 && ageYears <= 5) {
    let rate = 0;
    if (volumeCC <= 1000) rate = 1.5;
    else if (volumeCC <= 1500) rate = 1.7;
    else if (volumeCC <= 1800) rate = 2.5;
    else if (volumeCC <= 2300) rate = 2.7;
    else if (volumeCC <= 3000) rate = 3.0;
    else rate = 3.6;
    duty = rate * volumeCC;
  } else {
    let rate = 0;
    if (volumeCC <= 1000) rate = 3.0;
    else if (volumeCC <= 1500) rate = 3.2;
    else if (volumeCC <= 1800) rate = 3.5;
    else if (volumeCC <= 2300) rate = 4.8;
    else if (volumeCC <= 3000) rate = 5.0;
    else rate = 5.7;
    duty = rate * volumeCC;
  }

  return duty; // в евро
}

// --- Форматирование ---
function fmt(num, sym = "$") {
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${sym}`;
}

// --- Основной расчёт ---
btnCalc.addEventListener("click", () => {
  const priceVal = parseFloat(priceInput.value) || 0;
  const deliveryVal = parseFloat(deliveryInput.value) || 0;
  const volumeVal = parseFloat(volumeInput.value) || 0;
  const ageText = ageSelect.value;
  const benefit = benefitCheckbox.checked;

  const rateCNY = parseFloat(rateUSDCNY.value) || 7.27;
  const rateKRW = parseFloat(rateUSDKRW.value) || 1975;
  const rateEUR = parseFloat(rateUSDEUR.value) || 0.85;

  const priceUSD = currentCountry === "china" ? priceVal / rateCNY : priceVal / rateKRW;
  const priceEUR = priceUSD * rateEUR;

  // Перевод select → число лет
  const ageYears = ageText === "0-3" ? 3 : ageText === "3-5" ? 4 : 6;

  let dutyEUR = calcDuty(ageYears, volumeVal, priceEUR);
  if (benefit) dutyEUR /= 2;

  const dutyUSD = dutyEUR / rateEUR;

  const totalNoMargin = priceUSD + dutyUSD + deliveryVal;
  const commission = (priceUSD + deliveryVal) * 0.012;
  const utilFee = ageYears <= 3 ? 175 : 300;
  const customs = 40;
  const svh = 200;
  const broker = 300;

  const clientPrice = parseFloat(clientPriceInput.value) || 0;
  const margin = clientPrice ? clientPrice - totalNoMargin : 0;
  const fullCost = totalNoMargin + commission + utilFee + customs + svh + broker;

  const now = new Date();
  outDate.textContent = now.toLocaleString("ru-RU", { timeZone: "Europe/Minsk" });

  outPriceUSD.textContent = fmt(priceUSD);
  outPriceEUR.textContent = fmt(priceEUR, "€");
  outDutyUSD.textContent = fmt(dutyUSD);
  outDutyEUR.textContent = fmt(dutyEUR, "€");
  outDeliveryUSD.textContent = fmt(deliveryVal);
  outTotalNoMargin.textContent = fmt(totalNoMargin);
  outCommission.textContent = fmt(commission);
  outMargin.textContent = fmt(margin);
  outUtilUSD.textContent = fmt(utilFee);
  outCustomsUSD.textContent = fmt(customs);
  outSVHUSD.textContent = fmt(svh);
  outBrokerUSD.textContent = fmt(broker);
  outFullUSD.textContent = fmt(fullCost);
document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });

// --- Очистка ---
btnClear.addEventListener("click", () => {
  document.getElementById("calcForm").reset();
  outDate.textContent = "—";
  document.querySelectorAll("#results div[id^='out']").forEach(el => el.textContent = "0.00 $");
});

// --- Отправка через serverless function ---
btnSend.addEventListener("click", async () => {
  const data = {
    date: outDate.textContent,
    brandModel: brandModel.value || "",
    engineType: engineTypeSelect.options[engineTypeSelect.selectedIndex].text,
    volume: volumeInput.value || "",
    benefit: benefitCheckbox.checked ? "Да" : "Нет",
    delivery: deliveryInput.value || "",
    priceAuto: outPriceUSD.textContent.replace(/[^0-9.]/g, ""),
    totalAutoDeliveryDuty: outTotalNoMargin.textContent.replace(/[^0-9.]/g, ""),
    clientPrice: clientPriceInput.value || "",
    margin: outMargin.textContent.replace(/[^0-9.]/g, ""),
    fullCost: outFullUSD.textContent.replace(/[^0-9.]/g, ""),
    link: linkInput.value || "",
    country: currentCountry
  };

  try {
    const response = await fetch("/api/submit", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    alert("✅ Данные успешно отправлены в таблицу!");
  } catch (err) {
    console.error(err);
    alert("❌ Ошибка при отправке данных!");
  }
});

// --- Инициализация ---
setCountry("china");
