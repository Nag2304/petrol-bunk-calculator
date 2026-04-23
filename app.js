const rowsEl = document.querySelector("#nozzleRows");
const saleDateEl = document.querySelector("#saleDate");
const grandTotalEl = document.querySelector("#grandTotal");
const grandLitresEl = document.querySelector("#grandLitres");
const nozzleCountEl = document.querySelector("#nozzleCount");
const grossLitresEl = document.querySelector("#grossLitres");
const testLitresEl = document.querySelector("#testLitres");
const netLitresEl = document.querySelector("#netLitres");
const petrolGrossLitresEl = document.querySelector("#petrolGrossLitres");
const dieselGrossLitresEl = document.querySelector("#dieselGrossLitres");
const calculationTextEl = document.querySelector("#calculationText");
const toastEl = document.querySelector("#toast");

const storageKey = "petrol-bunk-calculator-v1";
const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
const litreFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3
});

const exampleRows = [
  { name: "Nozzle 1", fuel: "Petrol", close: 1200, open: 700, test: 5, rate: 110.34 },
  { name: "Nozzle 2", fuel: "Diesel", close: 1300, open: 600, test: 2, rate: 98.22 },
  { name: "Nozzle 3", fuel: "Diesel", close: 1900, open: 1000, test: 1, rate: 98.22 },
  { name: "Nozzle 4", fuel: "Petrol", close: 1600, open: 1200, test: 4, rate: 110.34 }
];

let rows = [];

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function uid() {
  return `row-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function numberValue(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculate(row) {
  const gross = numberValue(row.close) - numberValue(row.open);
  const sold = gross - numberValue(row.test);
  const amount = roundMoney(sold * numberValue(row.rate));
  return { gross, sold, amount };
}

function formatMoney(value) {
  return moneyFormatter.format(roundMoney(value));
}

function formatLitres(value) {
  return `${litreFormatter.format(value)} L`;
}

function trimNumber(value) {
  return Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 3,
    useGrouping: false
  });
}

function defaultFuel(name, index) {
  const normalized = String(name || "").toLowerCase();
  if (normalized.includes("1") || normalized.includes("4") || index === 0 || index === 3) {
    return "Petrol";
  }
  return "Diesel";
}

function rowTemplate(row, index) {
  const calc = calculate(row);
  const isInvalid = calc.sold < 0;
  return `
    <tr data-id="${row.id}" class="${isInvalid ? "row-error" : ""}">
      <td>
        <input class="name-input" data-field="name" value="${escapeHtml(row.name)}" aria-label="Nozzle name ${index + 1}">
      </td>
      <td>
        <select class="fuel-select" data-field="fuel" aria-label="${escapeHtml(row.name)} fuel type">
          <option value="Petrol" ${row.fuel === "Petrol" ? "selected" : ""}>Petrol</option>
          <option value="Diesel" ${row.fuel === "Diesel" ? "selected" : ""}>Diesel</option>
        </select>
      </td>
      <td>
        <input class="number-input" data-field="close" type="number" min="0" step="0.001" value="${row.close}" aria-label="${escapeHtml(row.name)} close reading">
      </td>
      <td>
        <input class="number-input" data-field="open" type="number" min="0" step="0.001" value="${row.open}" aria-label="${escapeHtml(row.name)} open reading">
      </td>
      <td>
        <input class="number-input" data-field="test" type="number" min="0" step="0.001" value="${row.test}" aria-label="${escapeHtml(row.name)} testing litres">
        ${isInvalid ? '<span class="field-note">Sold litres cannot be negative</span>' : ""}
      </td>
      <td>
        <input class="number-input" data-field="rate" type="number" min="0" step="0.01" value="${row.rate}" aria-label="${escapeHtml(row.name)} rate per litre">
      </td>
      <td><div class="computed">${formatLitres(calc.sold)}</div></td>
      <td><div class="computed amount">${formatMoney(calc.amount)}</div></td>
      <td>
        <button class="secondary remove-row" type="button" title="Remove ${escapeHtml(row.name)}" aria-label="Remove ${escapeHtml(row.name)}">
          <span aria-hidden="true">x</span>
        </button>
      </td>
    </tr>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function render() {
  rowsEl.innerHTML = rows.map(rowTemplate).join("");
  updateSummary();
  saveState();
}

function updateSummary() {
  const totals = rows.reduce(
    (acc, row) => {
      const calc = calculate(row);
      const fuelKey = row.fuel === "Petrol" ? "petrol" : "diesel";
      acc.gross += calc.gross;
      acc.test += numberValue(row.test);
      acc.net += calc.sold;
      acc.amount += calc.amount;
      acc[fuelKey].gross += calc.gross;
      acc[fuelKey].test += numberValue(row.test);
      acc[fuelKey].net += calc.sold;
      acc[fuelKey].amount += calc.amount;
      return acc;
    },
    {
      gross: 0,
      test: 0,
      net: 0,
      amount: 0,
      petrol: { gross: 0, test: 0, net: 0, amount: 0 },
      diesel: { gross: 0, test: 0, net: 0, amount: 0 }
    }
  );

  grandTotalEl.textContent = formatMoney(totals.amount);
  grandLitresEl.textContent = `${formatLitres(totals.net)} sold`;
  nozzleCountEl.textContent = rows.length;
  grossLitresEl.textContent = formatLitres(totals.gross);
  testLitresEl.textContent = formatLitres(totals.test);
  netLitresEl.textContent = formatLitres(totals.net);
  petrolGrossLitresEl.textContent = formatLitres(totals.petrol.gross);
  dieselGrossLitresEl.textContent = formatLitres(totals.diesel.gross);
  calculationTextEl.textContent = buildSummaryText(totals);
}

function buildSummaryText(totals) {
  const dateLine = saleDateEl.value ? `Date: ${saleDateEl.value}\n` : "";
  const rowLines = rows.map((row, index) => {
    const calc = calculate(row);
    return `${row.name || `Nozzle ${index + 1}`} (${row.fuel}): ${trimNumber(row.close)} close - ${trimNumber(row.open)} open - ${trimNumber(row.test)} test = ${trimNumber(calc.sold)} L x ${trimNumber(row.rate)} = ${formatMoney(calc.amount)}`;
  });

  return [
    dateLine.trimEnd(),
    ...rowLines,
    "",
    `Gross reading: ${formatLitres(totals.gross)}`,
    `Petrol gross reading: ${formatLitres(totals.petrol.gross)}`,
    `Diesel gross reading: ${formatLitres(totals.diesel.gross)}`,
    `Testing: ${formatLitres(totals.test)}`,
    `Net sold: ${formatLitres(totals.net)}`,
    `Petrol net sold: ${formatLitres(totals.petrol.net)} | ${formatMoney(totals.petrol.amount)}`,
    `Diesel net sold: ${formatLitres(totals.diesel.net)} | ${formatMoney(totals.diesel.amount)}`,
    `Total collection: ${formatMoney(totals.amount)}`,
    "",
    "Developed by Nagendra Babu",
    "Contact: jnb226@gmail.com"
  ].filter(Boolean).join("\n");
}

function addRow(data = {}) {
  const nextNumber = rows.length + 1;
  rows.push({
    id: uid(),
    name: data.name ?? `Nozzle ${nextNumber}`,
    fuel: data.fuel ?? defaultFuel(data.name, nextNumber - 1),
    close: data.close ?? "",
    open: data.open ?? "",
    test: data.test ?? 0,
    rate: data.rate ?? 110.34
  });
  render();
}

function setRows(nextRows) {
  rows = nextRows.map((row, index) => ({
    id: row.id || uid(),
    name: row.name || `Nozzle ${index + 1}`,
    fuel: row.fuel || defaultFuel(row.name, index),
    close: row.close ?? "",
    open: row.open ?? "",
    test: row.test ?? 0,
    rate: row.rate ?? 110.34
  }));
  render();
}

function saveState() {
  const state = {
    date: saleDateEl.value,
    rows
  };
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function loadState() {
  const stored = localStorage.getItem(storageKey);
  if (!stored) {
    saleDateEl.value = todayValue();
    setRows(exampleRows);
    return;
  }

  try {
    const state = JSON.parse(stored);
    saleDateEl.value = state.date || todayValue();
    setRows(Array.isArray(state.rows) && state.rows.length ? state.rows : exampleRows);
  } catch {
    saleDateEl.value = todayValue();
    setRows(exampleRows);
  }
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  window.setTimeout(() => toastEl.classList.remove("show"), 2200);
}

async function shareSummary() {
  const text = calculationTextEl.textContent;
  if (navigator.share) {
    try {
      await navigator.share({
        title: "Petrol bunk calculation",
        text
      });
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    showToast("Calculation copied to clipboard");
  } catch {
    fallbackCopy(text);
    showToast("Calculation selected for copying");
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function syncRowOutput(rowEl, row) {
  const calc = calculate(row);
  const testCell = rowEl.querySelector("td:nth-child(5)");
  const existingNote = testCell.querySelector(".field-note");

  rowEl.classList.toggle("row-error", calc.sold < 0);
  if (calc.sold < 0 && !existingNote) {
    testCell.insertAdjacentHTML("beforeend", '<span class="field-note">Sold litres cannot be negative</span>');
  }
  if (calc.sold >= 0 && existingNote) {
    existingNote.remove();
  }

  rowEl.querySelector("td:nth-child(7) .computed").textContent = formatLitres(calc.sold);
  rowEl.querySelector("td:nth-child(8) .computed").textContent = formatMoney(calc.amount);
}

function handleRowEdit(event) {
  const input = event.target.closest("input, select");
  if (!input) return;

  const rowEl = input.closest("tr");
  const row = rows.find((item) => item.id === rowEl.dataset.id);
  if (!row) return;

  row[input.dataset.field] = input.dataset.field === "name" ? input.value : input.value;
  updateSummary();
  saveState();

  syncRowOutput(rowEl, row);
}

rowsEl.addEventListener("input", handleRowEdit);
rowsEl.addEventListener("change", handleRowEdit);

rowsEl.addEventListener("click", (event) => {
  const button = event.target.closest(".remove-row");
  if (!button) return;

  const rowEl = button.closest("tr");
  rows = rows.filter((row) => row.id !== rowEl.dataset.id);
  if (!rows.length) addRow();
  render();
});

saleDateEl.addEventListener("change", saveState);

document.querySelector("#addRow").addEventListener("click", () => addRow());
document.querySelector("#loadExample").addEventListener("click", () => {
  saleDateEl.value = todayValue();
  setRows(exampleRows);
  showToast("Example values loaded");
});
document.querySelector("#clearRows").addEventListener("click", () => {
  saleDateEl.value = todayValue();
  setRows([{ name: "Nozzle 1", fuel: "Petrol", close: "", open: "", test: 0, rate: 110.34 }]);
  showToast("Sheet cleared");
});
document.querySelector("#shareSummary").addEventListener("click", shareSummary);
document.querySelector("#printSheet").addEventListener("click", () => window.print());

loadState();
