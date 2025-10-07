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
  const commission = totalNoMargin * 0.012;
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
});

// --- Очистка ---
btnClear.addEventListener("click", () => {
  document.getElementById("calcForm").reset();
  outDate.textContent = "—";
  document.querySelectorAll("#results div[id^='out']").forEach(el => el.textContent = "0.00 $");
});
// ============= Отправка в Telegram =============
btnSend.addEventListener("click", async () => {
  const token  = '7711504618:AAFIMzbrwJfV4If7os9bT671uuV1O-s25mg';
  const chatId = '-1002840988847';

  const engineText = engineTypeSelect.options[engineTypeSelect.selectedIndex].text;
  const benefitTxt = benefitCheckbox.checked ? "Да" : "Нет";

  // доп. данные
  const dutyUSD   = parseFloat(outDutyUSD.textContent.replace(/[^0-9.]/g, "")) || 0;
  const priceUSD  = parseFloat(outPriceUSD.textContent.replace(/[^0-9.]/g, "")) || 0;
  const delivery  = parseFloat(deliveryInput.value) || 0;
  const adDate    = outDate.textContent;

  const text = `
📊 <b>Новый расчёт ${currentCountry.toUpperCase()}</b>
├ Марка / модель:  <b>${brandModel.value || "—"}</b>
├ Год выпуска:     <b>${yearInput.value || "—"}</b>
├ Тип двигателя:   <b>${engineText}</b>
├ Пробег:          <i>${mileageInput.value || "—"} км</i>
├ Льгота №140:     <b>${benefitTxt}</b>
├ Стоимость авто:  <b>${fmt(priceUSD)}</b>
├ Доставка:        <b>${fmt(delivery)}</b>
├ Пошлина:         <b>${fmt(dutyUSD)}</b>
├ Стоимость итого: <b>${outTotalNoMargin.textContent}</b>
├ Цена клиенту:    <b>${clientPriceInput.value ? fmt(parseFloat(clientPriceInput.value)) : "—"}</b>
├ Прогноз цена:    <b>${outFullUSD.textContent}</b>
├ Дата объявки:    <i>${adDate}</i>
├ Комментарий:     <i>${commentInput.value || "—"}</i>
└ Ссылка: ${linkInput.value ? `<a href="${linkInput.value}">открыть объявление</a>` : "—"}
  `.trim();

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );

    if (!res.ok) throw new Error(res.statusText);
    alert("✅ Отправлено в Telegram-канал!");
  } catch (e) {
    console.error(e);
    alert("❌ Ошибка отправки в Telegram");
  }
});
// --- Инициализация ---
setCountry("china");
// === Плавный скролл к результатам ТОЛЬКО после клика на "Рассчитать" ===
btnCalc.addEventListener('click', () => {
  // ждём 100 мс, чтобы браузер успел отрисовать новые данные
  setTimeout(() => {
    const block = document.getElementById('results');
    if (block) block.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}, { once: false });   // false = не удаляем старый обработчик, просто добавляем ещё один
// мгновенный пересчёт маржи при изменении поля "Цена для клиента"
clientPriceInput.addEventListener('input', () => {
  const clientPrice = parseFloat(clientPriceInput.value) || 0;
  const totalNoMarginRaw = parseFloat(outTotalNoMargin.textContent.replace(/[^0-9.]/g, "")) || 0;
  const margin = clientPrice - totalNoMarginRaw;
  outMargin.textContent = fmt(margin);
});
// ========== сохранение курсов в localStorage ==========
window.addEventListener('DOMContentLoaded', () => {
  const fields = ['rateUSDCNY', 'rateUSDKRW', 'rateUSDEUR'];
  const defaults = { USDCNY: 7.27, USDKRW: 1975, USDEUR: 0.852 };

  // 1. восстанавливаем сохранённые или ставим дефолт
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const saved = localStorage.getItem(id);
    el.value = saved ?? defaults[id.replace('rate', '')];
  });

  // 2. сохраняем при изменении
  fields.forEach(id => {
    document.getElementById(id)?.addEventListener('input', e => {
      localStorage.setItem(id, e.target.value);
    });
  });
});
