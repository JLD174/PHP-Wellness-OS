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

render();
