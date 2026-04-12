const STORAGE_KEY = 'triple_d_loads';

const els = {
  form: document.getElementById('loadForm'),
  resetBtn: document.getElementById('resetBtn'),
  clearAllBtn: document.getElementById('clearAllBtn'),
  tableBody: document.getElementById('loadsTableBody'),
  grossLoad: document.getElementById('grossLoad'),
  loadedMiles: document.getElementById('loadedMiles'),
  deadheadOut: document.getElementById('deadheadOut'),
  deadheadReturn: document.getElementById('deadheadReturn'),
  mpg: document.getElementById('mpg'),
  fuelPrice: document.getElementById('fuelPrice'),
  driverPay: document.getElementById('driverPay'),
  otherExpenses: document.getElementById('otherExpenses'),
  previewTripMiles: document.getElementById('previewTripMiles'),
  previewGallons: document.getElementById('previewGallons'),
  previewFuelCost: document.getElementById('previewFuelCost'),
  previewNetProfit: document.getElementById('previewNetProfit'),
  previewSplit: document.getElementById('previewSplit'),
  totalGross: document.getElementById('totalGross'),
  totalFuel: document.getElementById('totalFuel'),
  totalExpenses: document.getElementById('totalExpenses'),
  totalNet: document.getElementById('totalNet'),
  ownerOne: document.getElementById('ownerOne'),
  ownerTwo: document.getElementById('ownerTwo'),
  heroGross: document.getElementById('heroGross'),
  heroNet: document.getElementById('heroNet'),
  heroSplit: document.getElementById('heroSplit'),
  heroLoads: document.getElementById('heroLoads')
};

function currency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
}

function num(value) {
  return Number(value || 0);
}

function getLoads() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function setLoads(loads) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loads));
}

function calcFromInputs() {
  const totalTripMiles = num(els.loadedMiles.value) + num(els.deadheadOut.value) + num(els.deadheadReturn.value);
  const gallons = totalTripMiles / Math.max(num(els.mpg.value), 0.1);
  const fuelCost = gallons * num(els.fuelPrice.value);
  const expenses = fuelCost + num(els.driverPay.value) + num(els.otherExpenses.value);
  const netProfit = num(els.grossLoad.value) - expenses;
  const split = netProfit / 2;

  els.previewTripMiles.textContent = totalTripMiles.toFixed(1);
  els.previewGallons.textContent = gallons.toFixed(2);
  els.previewFuelCost.textContent = currency(fuelCost);
  els.previewNetProfit.textContent = currency(netProfit);
  els.previewSplit.textContent = currency(split);

  return { totalTripMiles, gallons, fuelCost, expenses, netProfit, split };
}

function renderTotals(loads) {
  const totals = loads.reduce((acc, load) => {
    acc.gross += load.grossLoad;
    acc.fuel += load.fuelCost;
    acc.expenses += load.expenses;
    acc.net += load.netProfit;
    return acc;
  }, { gross: 0, fuel: 0, expenses: 0, net: 0 });

  els.totalGross.textContent = currency(totals.gross);
  els.totalFuel.textContent = currency(totals.fuel);
  els.totalExpenses.textContent = currency(totals.expenses);
  els.totalNet.textContent = currency(totals.net);
  els.ownerOne.textContent = currency(totals.net / 2);
  els.ownerTwo.textContent = currency(totals.net / 2);
  els.heroGross.textContent = currency(totals.gross);
  els.heroNet.textContent = currency(totals.net);
  els.heroSplit.textContent = currency(totals.net / 2);
  els.heroLoads.textContent = String(loads.length);
}

function renderLoads() {
  const loads = getLoads();
  renderTotals(loads);

  if (!loads.length) {
    els.tableBody.innerHTML = '<tr><td colspan="9" class="empty">No loads saved yet.</td></tr>';
    return;
  }

  els.tableBody.innerHTML = loads
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(load => `
      <tr>
        <td>${load.date}</td>
        <td>${load.loadId}</td>
        <td>${load.brokerName || '-'}</td>
        <td>${currency(load.grossLoad)}</td>
        <td>${currency(load.fuelCost)}</td>
        <td>${currency(load.expenses)}</td>
        <td>${currency(load.netProfit)}</td>
        <td>${currency(load.split)}</td>
        <td><button class="small-btn" onclick="deleteLoad('${load.id}')">Delete</button></td>
      </tr>
    `)
    .join('');
}

function resetForm() {
  els.form.reset();
  document.getElementById('mpg').value = '6.5';
  document.getElementById('loadDate').valueAsDate = new Date();
  calcFromInputs();
}

window.deleteLoad = function(id) {
  const updated = getLoads().filter(load => load.id !== id);
  setLoads(updated);
  renderLoads();
};

['input', 'change'].forEach(evt => {
  [els.grossLoad, els.loadedMiles, els.deadheadOut, els.deadheadReturn, els.mpg, els.fuelPrice, els.driverPay, els.otherExpenses]
    .forEach(el => el.addEventListener(evt, calcFromInputs));
});

els.form.addEventListener('submit', event => {
  event.preventDefault();
  const result = calcFromInputs();
  const loads = getLoads();

  loads.push({
    id: crypto.randomUUID(),
    loadId: document.getElementById('loadId').value.trim(),
    date: document.getElementById('loadDate').value,
    brokerName: document.getElementById('brokerName').value.trim(),
    grossLoad: num(document.getElementById('grossLoad').value),
    loadedMiles: num(document.getElementById('loadedMiles').value),
    deadheadOut: num(document.getElementById('deadheadOut').value),
    deadheadReturn: num(document.getElementById('deadheadReturn').value),
    mpg: num(document.getElementById('mpg').value),
    fuelPrice: num(document.getElementById('fuelPrice').value),
    driverPay: num(document.getElementById('driverPay').value),
    otherExpenses: num(document.getElementById('otherExpenses').value),
    notes: document.getElementById('notes').value.trim(),
    fuelCost: result.fuelCost,
    expenses: result.expenses,
    netProfit: result.netProfit,
    split: result.split
  });

  setLoads(loads);
  renderLoads();
  resetForm();
});

els.resetBtn.addEventListener('click', resetForm);
els.clearAllBtn.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  renderLoads();
  resetForm();
});

document.getElementById('loadDate').valueAsDate = new Date();
calcFromInputs();
renderLoads();
