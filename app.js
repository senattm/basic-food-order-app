const SESSION_KEY = "shoppingCart";
const LOCAL_KEY = "registeredAddress";
const DELIVERY_FEE = 45.0;
const CONSENT_COOKIE = "ys_consent";
const LAST_PAY_COOKIE = "ys_last_pay";

const menuItems = [
  { id: 1, name: "Hamburger", price: 350, desc: "Çift kat köfteli." },
  { id: 2, name: "Pizza", price: 300, desc: "Mantar, mısır, sosis, jambon." },
  { id: 3, name: "Cheesecake", price: 260.0, desc: "Limonlu, frambuazlı." },
  { id: 4, name: "Portakal Suyu", price: 125.0, desc: "Taze sıkılmış." },
];

function setCookie(name, value, days) {
  const maxAge = days ? `; max-age=${days * 24 * 60 * 60}` : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/${maxAge}; SameSite=Lax`;
}
function getCookie(name) {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1] &&
    decodeURIComponent(
      document.cookie
        .split("; ")
        .find((r) => r.startsWith(name + "="))
        .split("=")[1],
    )
  );
}
function eraseCookie(name) {
  setCookie(name, "", -1);
}
function hasConsent() {
  return getCookie(CONSENT_COOKIE) === "accepted";
}

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
function getSavedAddress() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) || null;
  } catch {
    return null;
  }
}

function calculateDeliveryFee(subtotal, cartLength) {
  if (cartLength === 0) return 0;
  return DELIVERY_FEE;
}
function computeTotals() {
  const cart = loadCart();
  const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
  const delivery = calculateDeliveryFee(subtotal, cart.length);
  const total = subtotal + delivery;
  return { subtotal, delivery, total };
}

function resolveMenuImage(id) {
  switch (id) {
    case 1:
      return "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop";
    case 2:
      return "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1170&auto=format&fit=crop";
    case 3:
      return "https://plus.unsplash.com/premium_photo-1722686461601-b2a018a4213b?q=80&w=955&auto=format&fit=crop";
    case 4:
      return "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=1200&auto=format&fit=crop";
    default:
      return "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1600&auto=format&fit=crop";
  }
}

function renderMenu() {
  const container = document.getElementById("menu-items-container");
  if (!container) return;
  container.innerHTML = "";
  menuItems.forEach((item) => {
    const col = document.createElement("div");
    col.className = "col";
    col.innerHTML = `
      <div class="card h-100 border-0 shadow-sm">
        <div class="ratio ratio-16x9">
          <img src="${resolveMenuImage(item.id)}" class="card-img-top w-100 h-100 object-fit-cover" alt="${item.name}">
        </div>
        <div class="card-body d-flex flex-column">
          <h3 class="h6 fw-bold mb-1">${item.name}</h3>
          <p class="text-secondary small mb-3">${item.desc || ""}</p>
          <div class="mt-auto d-flex justify-content-between align-items-center">
            <span class="fw-bold fs-5 text-primary">${item.price.toFixed(2)} ₺</span>
            <button class="btn btn-warning btn-sm fw-bold" data-add="${item.id}">
              Sepete Ekle
            </button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
  container.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = Number(e.currentTarget.getAttribute("data-add"));
      addToCart(id);
    });
  });
}

function addToCart(itemId) {
  const cart = loadCart();
  const found = cart.find((i) => i.id === itemId);
  if (found) {
    found.qty += 1;
  } else {
    const item = menuItems.find((m) => m.id === itemId);
    if (item)
      cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
  }
  saveCart(cart);
  renderCart();
}
function removeFromCart(itemId) {
  const cart = loadCart().filter((i) => i.id !== itemId);
  saveCart(cart);
  renderCart();
}

function renderCart() {
  const cart = loadCart();
  const list = document.getElementById("cart-list");
  const empty = document.getElementById("cart-empty-message");
  const countEl = document.getElementById("cart-item-count");

  list.innerHTML = "";
  if (cart.length === 0) {
    empty.classList.remove("d-none");
  } else {
    empty.classList.add("d-none");
    cart.forEach((row) => {
      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML = `
        <div>
          <strong>${row.name}</strong>
          <div class="small text-secondary">${row.qty} x ${row.price.toFixed(2)} ₺</div>
        </div>
        <div class="d-flex align-items-center gap-3">
          <span class="fw-semibold">${(row.qty * row.price).toFixed(2)} ₺</span>
          <button type="button" id="mybutton"; class="btn btn-outline-warning btn-sm rounded-circle d-flex align-items-center justify-content-center"
            style="width: 26px; height: 26px; padding: 0;" data-remove="${row.id}">
            <i class="bi bi-x-lg fs-6"></i>
          </button>
        </div>
      `;
      list.appendChild(li);
    });
    list.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = Number(e.currentTarget.getAttribute("data-remove"));
        removeFromCart(id);
      });
    });
  }

  const { subtotal, delivery, total } = computeTotals();
  document.getElementById("subtotal").textContent = `${subtotal.toFixed(2)} ₺`;
  document.getElementById("delivery-fee").textContent = cart.length
    ? `${DELIVERY_FEE.toFixed(2)} ₺`
    : `0.00 ₺`;
  document.getElementById("total-amount").textContent = `${total.toFixed(2)} ₺`;

  const totalQty = cart.reduce((acc, i) => acc + i.qty, 0);
  countEl.textContent = totalQty;
}

function saveAddress() {
  const title = document.getElementById("address-title-input").value.trim();
  const street = document.getElementById("street-address-input").value.trim();
  const city = document.getElementById("city-input").value.trim();

  if (!street || !city) {
    showInlineAlert(
      "Adres bilgileri eksik. Lütfen cadde/sokak ve şehir alanlarını doldurun.",
      "warning",
      "address-alert-area",
    );
    return;
  }

  const addr = { title, street, city };
  localStorage.setItem(LOCAL_KEY, JSON.stringify(addr));
  renderAddressInfo();
  showInlineAlert("Adres kaydedildi.", "success", "address-alert-area");
}

function renderAddressInfo() {
  const el = document.getElementById("current-user-info");
  try {
    const addr = getSavedAddress();
    el.textContent = addr
      ? `Mevcut Kayıt: ${addr.title || "Adres"} – ${addr.street || ""} ${addr.city || ""}`
      : "Mevcut Kayıt: (yok)";
  } catch {
    el.textContent = "Mevcut Kayıt: (yok)";
  }
}

function setCardRequired(isRequired) {
  const ids = ["fullName", "cardNumber", "expMonth", "expYear", "cvv"];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (isRequired) {
      el.setAttribute("required", "true");
    } else {
      el.removeAttribute("required");
      el.value = "";
    }
  });
}
function updatePaymentUI() {
  const selected = document.querySelector(
    'input[name="payMethod"]:checked',
  )?.value;
  const cardBox = document.getElementById("card-fields");
  const isCard = selected === "card";
  if (cardBox) {
    cardBox.classList.toggle("d-none", !isCard);
  }
  setCardRequired(isCard);

  if (hasConsent() && (selected === "card" || selected === "door")) {
    setCookie(LAST_PAY_COOKIE, selected, 180);
  }
}

function applyLastPaymentIfAny() {
  if (!hasConsent()) return;
  const v = getCookie(LAST_PAY_COOKIE);
  if (v === "card" || v === "door") {
    const el = document.getElementById(v === "card" ? "pm1" : "pm2");
    if (el) {
      el.checked = true;
      updatePaymentUI();
    }
  }
}
function initCookieConsent() {
  const bar = document.getElementById("cookie-consent");
  const btnAccept = document.getElementById("cookie-accept");
  const btnReject = document.getElementById("cookie-reject");
  if (!bar || !btnAccept || !btnReject) return;

  const consent = getCookie(CONSENT_COOKIE);
  if (!consent) {
    bar.classList.remove("d-none");
  } else {
    bar.classList.add("d-none");
    if (consent === "accepted") applyLastPaymentIfAny();
  }

  btnAccept.addEventListener("click", () => {
    setCookie(CONSENT_COOKIE, "accepted", 180);
    const selected =
      document.querySelector('input[name="payMethod"]:checked')?.value ||
      "card";
    setCookie(LAST_PAY_COOKIE, selected, 180);
    bar.classList.add("d-none");
    applyLastPaymentIfAny();
    showToast(
      "Çerezler kabul edildi. Ödeme tercihiniz hatırlanacak.",
      "success",
    );
  });

  btnReject.addEventListener("click", () => {
    setCookie(CONSENT_COOKIE, "rejected", 180);
    eraseCookie(LAST_PAY_COOKIE);
    bar.classList.add("d-none");
    showToast("Çerezler reddedildi. Tercihleriniz saklanmayacak.", "warning");
  });
}

let checkoutModal, successModal;

function showCheckoutScreen() {
  const cart = loadCart();
  if (cart.length === 0) {
    showToast("Sepet boş. Ödemeye geçmeden önce ürün ekleyin.", "warning");
    return;
  }

  const { subtotal, delivery, total } = computeTotals();
  document.getElementById("checkout-subtotal").textContent =
    `${subtotal.toFixed(2)} ₺`;
  document.getElementById("checkout-delivery").textContent =
    `${delivery.toFixed(2)} ₺`;
  document.getElementById("checkout-total-amount").textContent =
    `${total.toFixed(2)} ₺`;

  const disp = document.getElementById("checkout-user-display");
  const addrInput = document.getElementById("checkout-address");

  try {
    const addr = getSavedAddress();
    const line = addr
      ? `${addr.title || "Adres"} – ${addr.street || ""} ${addr.city || ""}`.trim()
      : "Kayıtlı adres yok";
    disp.textContent = line;
    addrInput.value = addr
      ? `${addr.street || ""} ${addr.city || ""}`.trim()
      : "";
  } catch {
    disp.textContent = "Kayıtlı adres yok";
    addrInput.value = "";
  }

  const form = document.getElementById("payment-form");
  form.reset();
  form.classList.remove("was-validated");
  hideInlineAlert("checkout-alert-area");

  applyLastPaymentIfAny();
  updatePaymentUI();

  checkoutModal.show();
}

function simulatePayment() {
  const addrInput = document.getElementById("checkout-address");
  const addrLine = addrInput.value.trim();
  const saved = getSavedAddress();
  const hasAddress = !!addrLine || (!!saved && !!saved.street && !!saved.city);

  if (!hasAddress) {
    showInlineAlert(
      "Adres bulunamadı. Lütfen teslimat adresi girin veya adresinizi kaydedin.",
      "danger",
      "checkout-alert-area",
    );
    return;
  }

  const form = document.getElementById("payment-form");
  const isCard =
    document.querySelector('input[name="payMethod"]:checked')?.value === "card";
  setCardRequired(isCard);

  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    showInlineAlert(
      "Ödeme bilgileriniz eksik veya hatalı. Lütfen formu kontrol edin.",
      "danger",
      "checkout-alert-area",
    );
    return;
  }

  if (hasConsent()) {
    const selected = isCard ? "card" : "door";
    setCookie(LAST_PAY_COOKIE, selected, 180);
  }

  sessionStorage.removeItem(SESSION_KEY);
  renderCart();
  checkoutModal.hide();
  successModal.show();
}

function showInlineAlert(message, type = "info", containerId) {
  const area = document.getElementById(containerId);
  if (!area) return;
  area.innerHTML = `
    <div class="alert alert-${type} d-flex align-items-center py-2 px-3 mb-3" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <div>${message}</div>
    </div>
  `;
}
function hideInlineAlert(containerId) {
  const area = document.getElementById(containerId);
  if (area) area.innerHTML = "";
}

let globalToast;
function showToast(msg, type = "primary") {
  const toastEl = document.getElementById("mainToast");
  if (!toastEl) return alert(msg);
  const body = toastEl.querySelector(".toast-body");
  body.textContent = msg;
  toastEl.className = `toast align-items-center text-bg-${type} border-0`;
  if (!globalToast) globalToast = new bootstrap.Toast(toastEl);
  globalToast.show();
}

document.addEventListener("DOMContentLoaded", () => {
  renderMenu();
  renderCart();
  renderAddressInfo();

  checkoutModal = new bootstrap.Modal(document.getElementById("checkoutModal"));
  successModal = new bootstrap.Modal(document.getElementById("successModal"));

  document
    .getElementById("btnSimPay")
    ?.addEventListener("click", simulatePayment);
  document.querySelectorAll('input[name="payMethod"]').forEach((r) => {
    r.addEventListener("change", updatePaymentUI);
  });

  initCookieConsent();

  updatePaymentUI();
});
