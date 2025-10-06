const SESSION_KEY = 'shoppingCart';
const LOCAL_KEY   = 'registeredAddress';
const DELIVERY_FEE = 45.00;

const menuItems = [
  { id: 1, name: 'Hamburger',    price: 350,   desc: 'Çift kat köfteli.' },
  { id: 2, name: 'Pizza',        price: 300,   desc: 'Mantar, mısır, sosis, jambon.' },
  { id: 3, name: 'Cheesecake',   price: 260.0, desc: 'Limonlu, frambuazlı.' },
  { id: 4, name: 'Portakal suyu',price: 125.0, desc: 'Taze sıkılmış.' },
];

function loadCart() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(cart));
}

function addToCart(itemId) {
  const cart = loadCart();
  const found = cart.find(i => i.id === itemId);
  if (found) {
    found.qty += 1;
  } else {
    const item = menuItems.find(m => m.id === itemId);
    if (item) cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
  }
  saveCart(cart);
  renderCart();
}

function removeFromCart(itemId) {
  let cart = loadCart().filter(i => i.id !== itemId);
  saveCart(cart);
  renderCart();
}

function computeTotals() {
  const cart = loadCart();
  const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
  const total = subtotal + DELIVERY_FEE;
  return { subtotal, total };
}

function renderMenu() {
  const container = document.getElementById('menu-items-container');
  if (!container) return;

  container.innerHTML = '';
  menuItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card menu-item';

    card.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.desc || ''}</p>
      <div class="menu-item-footer">
        <span class="menu-item-price">${item.price.toFixed(2)} ₺</span>
        <button class="btn btn-lavender" data-add="${item.id}">Sepete Ekle</button>
      </div>
    `;

    container.appendChild(card);
  });

  container.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = Number(e.currentTarget.getAttribute('data-add'));
      addToCart(id);
    });
  });
}

function renderCart() {
  const cart = loadCart();
  const list = document.getElementById('cart-list');
  const empty = document.getElementById('cart-empty-message');
  const countEl = document.getElementById('cart-item-count');

  list.innerHTML = '';
  if (cart.length === 0) {
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    cart.forEach(row => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <div>
          <strong>${row.name}</strong>
          <div style="font-size:.875rem;color:#555;">${row.qty} x ${row.price.toFixed(2)} ₺</div>
        </div>
        <div style="display:flex;gap:.5rem;align-items:center;">
          <span>${(row.qty * row.price).toFixed(2)} ₺</span>
          <button class="btn-remove" title="Kaldır" data-remove="${row.id}">✕</button>
        </div>
      `;
      list.appendChild(li);
    });

    list.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.getAttribute('data-remove'));
        removeFromCart(id);
      });
    });
  }

  const { subtotal, total } = computeTotals();
  document.getElementById('subtotal').textContent = `${subtotal.toFixed(2)} ₺`;
  document.getElementById('delivery-fee').textContent = `${DELIVERY_FEE.toFixed(2)} ₺`;
  document.getElementById('total-amount').textContent = `${total.toFixed(2)} ₺`;

  const totalQty = cart.reduce((acc, i) => acc + i.qty, 0);
  countEl.textContent = totalQty;
}

function saveAddress() {
  const title = document.getElementById('address-title-input').value.trim();
  const street = document.getElementById('street-address-input').value.trim();
  const city = document.getElementById('city-input').value.trim();

  const addr = { title, street, city };
  localStorage.setItem(LOCAL_KEY, JSON.stringify(addr));
  renderAddressInfo();
}

function renderAddressInfo() {
  const el = document.getElementById('current-user-info');
  try {
    const addr = JSON.parse(localStorage.getItem(LOCAL_KEY));
    el.textContent = addr
      ? `Mevcut Kayıt: ${addr.title || 'Adres'} – ${addr.street || ''} ${addr.city || ''}`
      : 'Mevcut Kayıt: (yok)';
  } catch {
    el.textContent = 'Mevcut Kayıt: (yok)';
  }
}

function showCheckoutScreen() {
  const screen = document.getElementById('checkout-screen');
  screen.style.display = 'flex';

  const { subtotal, total } = computeTotals();
  document.getElementById('checkout-subtotal').textContent = `${subtotal.toFixed(2)} ₺`;
  document.getElementById('checkout-delivery').textContent = `${DELIVERY_FEE.toFixed(2)} ₺`;
  document.getElementById('checkout-total-amount').textContent = `${total.toFixed(2)} ₺`;

  const disp = document.getElementById('checkout-user-display');
  const addrInput = document.getElementById('checkout-address');
  try {
    const addr = JSON.parse(localStorage.getItem(LOCAL_KEY));
    const line = addr ? `${addr.title || 'Adres'} – ${addr.street || ''} ${addr.city || ''}` : 'Kayıtlı adres yok';
    disp.textContent = line;
    addrInput.value = addr ? `${addr.street || ''} ${addr.city || ''}`.trim() : '';
  } catch {
    disp.textContent = 'Kayıtlı adres yok';
    addrInput.value = '';
  }
}
function hideCheckoutScreen() {
  document.getElementById('checkout-screen').style.display = 'none';
}

function simulatePayment() {
  sessionStorage.removeItem(SESSION_KEY);
  renderCart();
  document.getElementById('checkout-screen').style.display = 'none';
  document.getElementById('success-modal').style.display = 'flex';
}
function closeSuccessModal() {
  document.getElementById('success-modal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  renderCart();
  renderAddressInfo();
});

window.showCheckoutScreen = showCheckoutScreen;
window.hideCheckoutScreen = hideCheckoutScreen;
window.simulatePayment = simulatePayment;
window.saveAddress = saveAddress;
window.closeSuccessModal = closeSuccessModal;