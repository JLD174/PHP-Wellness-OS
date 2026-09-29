const STORAGE_KEY = 'expenses';

function loadExpenses() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveExpenses(expenses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function render() {
  const expenses = loadExpenses();
  const list = document.getElementById('expense-list');
  list.innerHTML = '';
  let total = 0;

  for (const e of expenses) {
    const row = document.createElement('tr');
    for (const value of [e.date, e.category, e.amount.toFixed(2), e.description]) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    }
    list.appendChild(row);
    total += e.amount;
  }

  document.getElementById('total').textContent = total.toFixed(2);
}

document.getElementById('expense-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const expenses = loadExpenses();
  expenses.push({
    date: document.getElementById('date').value,
    category: document.getElementById('category').value,
    amount: parseFloat(document.getElementById('amount').value),
    description: document.getElementById('description').value.trim(),
  });
  saveExpenses(expenses);
  event.target.reset();
  render();
});

function csvField(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// Spreadsheet apps run cells starting with these characters as formulas
// (CSV injection). A leading apostrophe makes them plain text.
function neutralizeFormula(value) {
  const text = String(value ?? '');
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

// Filters are optional; an empty field means "no limit". Dates are
// YYYY-MM-DD strings, so plain string comparison orders them correctly.
function filteredExpenses() {
  const from = document.getElementById('export-from').value;
  const to = document.getElementById('export-to').value;
  const category = document.getElementById('export-category').value;
  return loadExpenses().filter((e) =>
    (!from || e.date >= from) &&
    (!to || e.date <= to) &&
    (!category || e.category === category));
}

// Local date, not toISOString(), which is UTC and can be off by a day.
function todayStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function exportCsv() {
  const rows = [['Date', 'Category', 'Amount', 'Description']];
  for (const e of filteredExpenses()) {
    rows.push([e.date, neutralizeFormula(e.category), e.amount.toFixed(2), neutralizeFormula(e.description)]);
  }
  const csv = rows.map((row) => row.map(csvField).join(',')).join('\r\n');

  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `expenses-${todayStamp()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Reuse the add-expense form's categories so the two lists can't drift apart.
for (const option of document.getElementById('category').options) {
  document.getElementById('export-category').add(new Option(option.text, option.value));
}

document.getElementById('export-btn').addEventListener('click', exportCsv);

render();
