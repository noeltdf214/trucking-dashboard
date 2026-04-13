const STORAGE_KEY = 'triple_d_ops_v2';
const SESSION_KEY = 'triple_d_session';

const demoUsers = {
  ownerNoel: { name: 'Noel Yanez', role: 'Owner', defaultView: 'ownerView', note: 'Full owner access' },
  ownerCarlos: { name: 'Carlos Terrazas', role: 'Owner', defaultView: 'ownerView', note: 'Full owner access' },
  driverDemo: { name: 'Driver Demo', role: 'Driver', defaultView: 'driverView', note: 'Assigned load board only' },
  clientDemo: { name: 'Client Demo', role: 'Client', defaultView: 'clientView', note: 'Shipment tracking view' }
};

const els = {
  form: document.getElementById('loadForm'),
  editingId: document.getElementById('editingId'),
  formTitle: document.getElementById('formTitle'),
  saveBtn: document.getElementById('saveBtn'),
  resetBtn: document.getElementById('resetBtn'),
  clearAllBtn: document.getElementById('clearAllBtn'),
  exportCsvBtn: document.getElementById('exportCsvBtn'),
  seedDemoBtn: document.getElementById('seedDemoBtn'),
  searchInput: document.getElementById('searchInput'),
  statusFilter: document.getElementById('statusFilter'),
  tableBody: document.getElementById('loadsTableBody'),
  driverCards: document.getElementById('driverCards'),
  clientCards: document.getElementById('clientCards'),
  currentUserName: document.getElementById('currentUserName'),
  currentUserMeta: document.getElementById('currentUserMeta'),
  sidebarTotalLoads: document.getElementById('sidebarTotalLoads'),
  sidebarDeliveredLoads: document.getElementById('sidebarDeliveredLoads'),
  sidebarTransitLoads: document.getElementById('sidebarTransitLoads'),
  todayLabel: document.getElementById('todayLabel'),
  totalGross: document.getElementById('totalGross'),
  totalFuel: document.getElementById('totalFuel'),
  totalExpenses: document.getElementById('totalExpenses'),
  totalNet: document.getElementById('totalNet'),
  ownerOne: document.getElementById('ownerOne'),
  ownerTwo: document.getElementById('ownerTwo'),
  highestGross: document.getElementById('highestGross'),
  avgNet: document.getElementById('avgNet'),
  totalMiles: document.getElementById('totalMiles'),
  totalGallons: document.getElementById('totalGallons'),
  heroGross: document.getElementById('heroGross'),
  heroNet: document.getElementById('heroNet'),
  heroActiveLoads: document.getElementById('heroActiveLoads'),
  heroSplit: document.getElementById('heroSplit'),
  previewTripMiles: document.getElementById('previewTripMiles'),
  previewGallons: document.getElementById('previewGallons'),
  previewFuelCost: document.getElementById('previewFuelCost'),
  previewNetProfit: document.getElementById('previewNetProfit'),
  previewSplit: document.getElementById('previewSplit'),
  connectionBadge: document.getElementById('connectionBadge'),
  loginModal: document.getElementById('loginModal'),
  openLoginBtn: document.getElementById('openLoginBtn'),
  closeLoginBtn: document.getElementById('closeLoginBtn'),
  demoLoginBtn: document.getElementById('demoLoginBtn'),
  loadId: document.getElementById('loadId'),
  loadDate: document.getElementById('loadDate'),
  brokerName: document.getElementById('brokerName'),
  driverName: document.getElementById('driverName'),
  pickupLocation: document.getElementById('pickupLocation'),
  deliveryLocation: document.getElementById('deliveryLocation'),
  loadStatus: document.getElementById('loadStatus'),
  grossLoad: document.getElementById('grossLoad'),
  loadedMiles: document.getElementById('loadedMiles'),
  deadheadOut: document.getElementById('deadheadOut'),
  deadheadReturn: document.getElementById('deadheadReturn'),
  mpg: document.getElementById('mpg'),
  fuelPrice: document.getElementById('fuelPrice'),
  driverPay: document.getElementById('driverPay'),
  otherExpenses: document.getElementById('otherExpenses'),
  notes: document.getElementById('notes')
};

const liveCalcInputs = [
  els.grossLoad,
  els.loadedMiles,
  els.deadheadOut,
  els.deadheadReturn,
  els.mpg,
  els.fuelPrice,
  els.driverPay,
  els.otherExpenses
];

function currency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
}

function num(value) {
  return Number(value || 0);
}

function safeText(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSession(userKey) {
  if (!userKey) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userKey }));
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

function currentUser() {
  const session = getSession();
  return session ? demoUsers[session.userKey] : null;
}

function setCurrentUserUI() {
  const user = currentUser();
  els.currentUserName.textContent = user ? user.name : 'Guest';
  els.currentUserMeta.textContent = user ? `${user.role} • ${user.note}` : 'Open the demo login to enter the workspace.';
}

function resetForm() {
  els.form.reset();
  els.editingId.value = '';
  els.formTitle.textContent = 'Add or update load';
  els.saveBtn.textContent = 'Save Load';
  els.mpg.value = '6.5';
  els.loadStatus.value = 'Booked';
  els.loadDate.valueAsDate = new Date();
  calcFromInputs();
}

function populateForm(load) {
  els.editingId.value = load.id;
  els.formTitle.textContent = `Editing ${load.loadId}`;
  els.saveBtn.textContent = 'Update Load';
  els.loadId.value = load.loadId;
  els.loadDate.value = load.date;
  els.brokerName.value = load.brokerName || '';
  els.driverName.value = load.driverName || '';
  els.pickupLocation.value = load.pickupLocation || '';
  els.deliveryLocation.value = load.deliveryLocation || '';
  els.loadStatus.value = load.loadStatus || 'Booked';
  els.grossLoad.value = load.grossLoad;
  els.loadedMiles.value = load.loadedMiles;
  els.deadheadOut.value = load.deadheadOut;
  els.deadheadReturn.value = load.deadheadReturn;
  els.mpg.value = load.mpg;
  els.fuelPrice.value = load.fuelPrice;
  els.driverPay.value = load.driverPay;
  els.otherExpenses.value = load.otherExpenses;
  els.notes.value = load.notes || '';
  calcFromInputs();
  document.getElementById('workspace').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteLoad(id) {
  const updated = getLoads().filter(load => load.id !== id);
  setLoads(updated);
  renderAll();
}

function filteredLoads() {
  const loads = getLoads();
  const query = els.searchInput.value.trim().toLowerCase();
  const status = els.statusFilter.value;

  return loads
    .filter(load => {
      const matchesStatus = status === 'All' || load.loadStatus === status;
      const haystack = [load.loadId, load.brokerName, load.driverName, load.pickupLocation, load.deliveryLocation, load.notes]
        .join(' ')
        .toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      return matchesStatus && matchesQuery;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderTotals(loads) {
  const totals = loads.reduce((acc, load) => {
    acc.gross += load.grossLoad;
    acc.fuel += load.fuelCost;
    acc.expenses += load.expenses;
    acc.net += load.netProfit;
    acc.miles += load.totalTripMiles;
    acc.gallons += load.gallons;
    acc.highestGross = Math.max(acc.highestGross, load.grossLoad);
    if (load.loadStatus === 'Delivered' || load.loadStatus === 'Paid') acc.delivered += 1;
    if (load.loadStatus === 'In Transit' || load.loadStatus === 'Dispatched') acc.inTransit += 1;
    return acc;
  }, { gross: 0, fuel: 0, expenses: 0, net: 0, miles: 0, gallons: 0, highestGross: 0, delivered: 0, inTransit: 0 });

  els.totalGross.textContent = currency(totals.gross);
  els.totalFuel.textContent = currency(totals.fuel);
  els.totalExpenses.textContent = currency(totals.expenses);
  els.totalNet.textContent = currency(totals.net);
  els.ownerOne.textContent = currency(totals.net / 2);
  els.ownerTwo.textContent = currency(totals.net / 2);
  els.highestGross.textContent = currency(totals.highestGross);
  els.avgNet.textContent = currency(loads.length ? totals.net / loads.length : 0);
  els.totalMiles.textContent = totals.miles.toFixed(1);
  els.totalGallons.textContent = totals.gallons.toFixed(2);
  els.heroGross.textContent = currency(totals.gross);
  els.heroNet.textContent = currency(totals.net);
  els.heroSplit.textContent = currency(totals.net / 2);
  els.heroActiveLoads.textContent = String(loads.filter(load => !['Delivered', 'Paid'].includes(load.loadStatus)).length);
  els.sidebarTotalLoads.textContent = String(loads.length);
  els.sidebarDeliveredLoads.textContent = String(totals.delivered);
  els.sidebarTransitLoads.textContent = String(totals.inTransit);
}

function renderLoadTable(loads) {
  if (!loads.length) {
    els.tableBody.innerHTML = '<tr><td colspan="10" class="empty">No loads match the current filter.</td></tr>';
    return;
  }

  els.tableBody.innerHTML = loads.map(load => `
    <tr>
      <td>${safeText(load.date)}</td>
      <td>${safeText(load.loadId)}</td>
      <td><span class="badge" data-status="${safeText(load.loadStatus)}">${safeText(load.loadStatus)}</span></td>
      <td>${safeText(load.brokerName || '-')}</td>
      <td>${safeText(load.driverName || '-')}</td>
      <td>${currency(load.grossLoad)}</td>
      <td>${currency(load.fuelCost)}</td>
      <td>${currency(load.netProfit)}</td>
      <td>${currency(load.split)}</td>
      <td>
        <button class="small-btn" type="button" data-action="edit" data-id="${load.id}">Edit</button>
        <button class="small-btn danger" type="button" data-action="delete" data-id="${load.id}">Delete</button>
      </td>
    </tr>
  `).join('');
}

function renderDriverCards(loads) {
  if (!loads.length) {
    els.driverCards.innerHTML = '<article class="load-card"><p class="muted">No assigned loads yet.</p></article>';
    return;
  }

  els.driverCards.innerHTML = loads.map(load => `
    <article class="load-card">
      <div class="load-card-head">
        <div>
          <h3>${safeText(load.loadId)}</h3>
          <p class="muted">Driver: ${safeText(load.driverName || 'Unassigned')}</p>
        </div>
        <span class="badge" data-status="${safeText(load.loadStatus)}">${safeText(load.loadStatus)}</span>
      </div>
      <div class="load-card-grid">
        <div><strong>Pickup</strong><p class="muted">${safeText(load.pickupLocation || '-')}</p></div>
        <div><strong>Delivery</strong><p class="muted">${safeText(load.deliveryLocation || '-')}</p></div>
        <div><strong>Date</strong><p class="muted">${safeText(load.date)}</p></div>
        <div><strong>Broker</strong><p class="muted">${safeText(load.brokerName || '-')}</p></div>
      </div>
      <p class="muted">${safeText(load.notes || 'No notes')}</p>
    </article>
  `).join('');
}

function renderClientCards(loads) {
  if (!loads.length) {
    els.clientCards.innerHTML = '<article class="load-card"><p class="muted">No shipment records yet.</p></article>';
    return;
  }

  els.clientCards.innerHTML = loads.map(load => `
    <article class="load-card">
      <div class="load-card-head">
        <div>
          <h3>${safeText(load.loadId)}</h3>
          <p class="muted">${safeText(load.brokerName || 'Shipment')}</p>
        </div>
        <span class="badge" data-status="${safeText(load.loadStatus)}">${safeText(load.loadStatus)}</span>
      </div>
      <div class="load-card-grid">
        <div><strong>Pickup</strong><p class="muted">${safeText(load.pickupLocation || '-')}</p></div>
        <div><strong>Delivery</strong><p class="muted">${safeText(load.deliveryLocation || '-')}</p></div>
      </div>
    </article>
  `).join('');
}

function renderAll() {
  const allLoads = getLoads();
  const visibleLoads = filteredLoads();
  renderTotals(allLoads);
  renderLoadTable(visibleLoads);
  renderDriverCards(allLoads);
  renderClientCards(allLoads);
  setCurrentUserUI();
}

function setView(viewId) {
  document.querySelectorAll('.view-panel').forEach(panel => panel.classList.toggle('active', panel.id === viewId));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewId));
}

function applyRoleView(user) {
  const selectedView = user ? user.defaultView : 'ownerView';
  setView(selectedView);
}

function loginAs(userKey) {
  setSession(userKey);
  const user = currentUser();
  applyRoleView(user);
  setCurrentUserUI();
  closeLogin();
}

function openLogin() {
  els.loginModal.classList.add('active');
  els.loginModal.setAttribute('aria-hidden', 'false');
}

function closeLogin() {
  els.loginModal.classList.remove('active');
  els.loginModal.setAttribute('aria-hidden', 'true');
}

function exportCsv() {
  const loads = filteredLoads();
  if (!loads.length) {
    window.alert('No loads available to export.');
    return;
  }

  const headers = ['Date', 'Load ID', 'Status', 'Broker', 'Driver', 'Pickup', 'Delivery', 'Gross', 'Fuel Cost', 'Expenses', 'Net Profit', 'Owner Split', 'Notes'];
  const rows = loads.map(load => [
    load.date,
    load.loadId,
    load.loadStatus,
    load.brokerName,
    load.driverName,
    load.pickupLocation,
    load.deliveryLocation,
    load.grossLoad,
    load.fuelCost,
    load.expenses,
    load.netProfit,
    load.split,
    (load.notes || '').replace(/\n/g, ' ')
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'triple-d-loads.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function seedDemoData() {
  const loads = [
    {
      id: crypto.randomUUID(),
      loadId: 'TD-1001',
      date: new Date().toISOString().slice(0, 10),
      brokerName: 'Lone Star Freight',
      driverName: 'Driver Demo',
      pickupLocation: 'Dallas, TX',
      deliveryLocation: 'Houston, TX',
      loadStatus: 'In Transit',
      grossLoad: 2800,
      loadedMiles: 240,
      deadheadOut: 42,
      deadheadReturn: 15,
      mpg: 6.5,
      fuelPrice: 3.69,
      driverPay: 700,
      otherExpenses: 95,
      notes: 'Call receiver 30 minutes before arrival.'
    },
    {
      id: crypto.randomUUID(),
      loadId: 'TD-1002',
      date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      brokerName: 'Metro National Logistics',
      driverName: 'Carlos',
      pickupLocation: 'Fort Worth, TX',
      deliveryLocation: 'San Antonio, TX',
      loadStatus: 'Delivered',
      grossLoad: 3450,
      loadedMiles: 274,
      deadheadOut: 37,
      deadheadReturn: 70,
      mpg: 6.5,
      fuelPrice: 3.55,
      driverPay: 875,
      otherExpenses: 140,
      notes: 'POD received.'
    },
    {
      id: crypto.randomUUID(),
      loadId: 'TD-1003',
      date: new Date(Date.now() - 172800000).toISOString().slice(0, 10),
      brokerName: 'Blue Route Transport',
      driverName: 'Noel',
      pickupLocation: 'Dallas, TX',
      deliveryLocation: 'Oklahoma City, OK',
      loadStatus: 'Paid',
      grossLoad: 2200,
      loadedMiles: 205,
      deadheadOut: 30,
      deadheadReturn: 32,
      mpg: 6.5,
      fuelPrice: 3.48,
      driverPay: 550,
      otherExpenses: 80,
      notes: 'Paid in 2 days.'
    }
  ].map(withCalculatedFields);

  setLoads(loads);
  renderAll();
}

function withCalculatedFields(load) {
  const totalTripMiles = num(load.loadedMiles) + num(load.deadheadOut) + num(load.deadheadReturn);
  const gallons = totalTripMiles / Math.max(num(load.mpg), 0.1);
  const fuelCost = gallons * num(load.fuelPrice);
  const expenses = fuelCost + num(load.driverPay) + num(load.otherExpenses);
  const netProfit = num(load.grossLoad) - expenses;
  const split = netProfit / 2;

  return {
    ...load,
    totalTripMiles,
    gallons,
    fuelCost,
    expenses,
    netProfit,
    split
  };
}

function handleSubmit(event) {
  event.preventDefault();
  const existingLoads = getLoads();
  const result = calcFromInputs();
  const payload = withCalculatedFields({
    id: els.editingId.value || crypto.randomUUID(),
    loadId: els.loadId.value.trim(),
    date: els.loadDate.value,
    brokerName: els.brokerName.value.trim(),
    driverName: els.driverName.value.trim(),
    pickupLocation: els.pickupLocation.value.trim(),
    deliveryLocation: els.deliveryLocation.value.trim(),
    loadStatus: els.loadStatus.value,
    grossLoad: num(els.grossLoad.value),
    loadedMiles: num(els.loadedMiles.value),
    deadheadOut: num(els.deadheadOut.value),
    deadheadReturn: num(els.deadheadReturn.value),
    mpg: num(els.mpg.value),
    fuelPrice: num(els.fuelPrice.value),
    driverPay: num(els.driverPay.value),
    otherExpenses: num(els.otherExpenses.value),
    notes: els.notes.value.trim(),
    fuelCost: result.fuelCost,
    expenses: result.expenses,
    netProfit: result.netProfit,
    split: result.split
  });

  const index = existingLoads.findIndex(load => load.id === payload.id);
  if (index >= 0) {
    existingLoads[index] = payload;
  } else {
    existingLoads.push(payload);
  }

  setLoads(existingLoads);
  renderAll();
  resetForm();
}

function handleTableClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const id = button.dataset.id;
  const load = getLoads().find(item => item.id === id);
  if (!load) return;

  if (button.dataset.action === 'edit') {
    populateForm(load);
  }

  if (button.dataset.action === 'delete') {
    deleteLoad(id);
  }
}

function initTodayLabel() {
  els.todayLabel.textContent = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date());
}

function initConnectionBadge() {
  els.connectionBadge.textContent = 'Local Mode';
  els.connectionBadge.className = 'status-pill warning';
}

function initViewLinks() {
  document.querySelectorAll('[data-jump]').forEach(button => {
    button.addEventListener('click', () => {
      const target = document.querySelector(button.dataset.jump);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', () => setView(button.dataset.view));
  });

  document.querySelectorAll('.login-option').forEach(button => {
    button.addEventListener('click', () => loginAs(button.dataset.user));
  });
}

function initEvents() {
  els.form.addEventListener('submit', handleSubmit);
  els.resetBtn.addEventListener('click', resetForm);
  els.clearAllBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    renderAll();
    resetForm();
  });
  els.exportCsvBtn.addEventListener('click', exportCsv);
  els.seedDemoBtn.addEventListener('click', seedDemoData);
  els.tableBody.addEventListener('click', handleTableClick);
  els.searchInput.addEventListener('input', renderAll);
  els.statusFilter.addEventListener('change', renderAll);
  els.openLoginBtn.addEventListener('click', openLogin);
  els.demoLoginBtn.addEventListener('click', openLogin);
  els.closeLoginBtn.addEventListener('click', closeLogin);
  els.loginModal.addEventListener('click', event => {
    if (event.target === els.loginModal) closeLogin();
  });

  ['input', 'change'].forEach(evt => {
    liveCalcInputs.forEach(input => input.addEventListener(evt, calcFromInputs));
  });
}

function initSession() {
  const user = currentUser();
  if (user) {
    applyRoleView(user);
    closeLogin();
  } else {
    setView('ownerView');
    openLogin();
  }
}

function init() {
  initTodayLabel();
  initConnectionBadge();
  initViewLinks();
  initEvents();
  resetForm();
  initSession();
  renderAll();
}

init();
