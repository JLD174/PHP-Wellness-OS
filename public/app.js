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

function exportCsv() {
  const rows = [['Date', 'Category', 'Amount', 'Description']];
  for (const e of loadExpenses()) {
    rows.push([e.date, e.category, e.amount.toFixed(2), e.description]);
  }
  const csv = rows.map((row) => row.map(csvField).join(',')).join('\r\n');

  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'expenses.csv';
  link.click();
  URL.revokeObjectURL(url);
}

document.getElementById('export-btn').addEventListener('click', exportCsv);

render();
