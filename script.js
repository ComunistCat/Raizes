// Guarda os dados no navegador para o protótipo funcionar sem servidor.
function getData() {
  const saved = localStorage.getItem(MOCK_STORAGE_KEY);
  if (saved) {
    const data = JSON.parse(saved);
    data.dishes = structuredClone(defaultMockData.dishes);
    data.rewards = structuredClone(defaultMockData.rewards);
    data.cart = data.cart.map((item) => {
      const dish = data.dishes.find((dishItem) => item.id === dishItem.id || item.id.startsWith(`${dishItem.id}-reward-`));
      return dish ? { ...item, image: dish.image } : item;
    });
    saveData(data);
    return data;
  }

  const initialData = structuredClone(defaultMockData);
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
}

function saveData(data) {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
}

function formatMoney(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getUserPoints(data) {
  return data.pointsByEmail[data.loggedUserEmail] || 0;
}

function setUserPoints(data, points) {
  data.pointsByEmail[data.loggedUserEmail] = points;
}

function getItemPrice(item) {
  if (!item.discount) {
    return item.price;
  }
  return item.price * (1 - item.discount / 100);
}

function cartSubtotal(cart) {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function showMessage(elementId, text) {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.textContent = text;
}

// mostra uma espera falsa para parecer um app real
function showLoading(title, text, doneText, callback) {
  const overlay = document.getElementById("loading-overlay");
  if (!overlay) {
    callback();
    return;
  }

  const loader = overlay.querySelector(".loader");
  const successIcon = overlay.querySelector(".success-icon");
  document.getElementById("loading-title").textContent = title;
  document.getElementById("loading-text").textContent = text;
  loader.classList.remove("hidden");
  successIcon.classList.add("hidden");
  overlay.classList.remove("hidden");

  setTimeout(() => {
    loader.classList.add("hidden");
    successIcon.classList.remove("hidden");
    document.getElementById("loading-title").textContent = doneText;
    document.getElementById("loading-text").textContent = "";
    setTimeout(callback, 700);
  }, 2000);
}

function initLogin() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const showRegister = document.getElementById("show-register");
  const hideRegister = document.getElementById("hide-register");

  showRegister.addEventListener("click", () => {
    registerForm.classList.remove("hidden");
    document.getElementById("register-email").value = document.getElementById("login-email").value;
  });

  hideRegister.addEventListener("click", () => registerForm.classList.add("hidden"));

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = getData();
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const user = data.users.find((item) => item.email === email);
    if (!user) {
      showMessage("login-message", "Usuário não encontrado, clique em ‘Cadastrar-se como cliente’.");
      return;
    }

    data.loggedUserEmail = email;
    saveData(data);
    showLoading("Autenticando", "Validando seus dados", "Autenticação concluída", () => {
      window.location.href = "menu.html";
    });
  });

  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = getData();
    const newUser = {
      name: document.getElementById("register-name").value.trim(),
      email: document.getElementById("register-email").value.trim().toLowerCase(),
      phone: document.getElementById("register-phone").value.trim(),
      address: document.getElementById("register-address").value.trim()
    };

    // troca o cadastro antigo se usar o mesmo e-mail
    data.users = data.users.filter((user) => user.email !== newUser.email);
    data.users.push(newUser);
    data.loggedUserEmail = newUser.email;
    data.pointsByEmail[newUser.email] = data.pointsByEmail[newUser.email] || 0;
    saveData(data);
    showLoading("Cadastrando", "Salvando seus dados", "Cadastro concluído", () => {
      window.location.href = "menu.html";
    });
  });
}

function initCatalog() {
  document.querySelectorAll("[data-add-item]").forEach((button) => {
    button.addEventListener("click", () => addToCart(button.dataset.addItem));
  });

  updateCartFloat();
}

function addToCart(itemId) {
  const data = getData();
  const item = data.dishes.find((dish) => dish.id === itemId);
  const cartItem = data.cart.find((cartEntry) => cartEntry.id === itemId && !cartEntry.reward);

  // se o item já está no carrinho, só aumenta a quantidade
  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    data.cart.push({
      id: item.id,
      name: item.name,
      price: getItemPrice(item),
      quantity: 1,
      image: item.image,
      description: item.description
    });
  }

  saveData(data);
  updateCartFloat();
}

function updateCartFloat() {
  const total = document.getElementById("cart-total");
  if (total) total.textContent = formatMoney(cartSubtotal(getData().cart));
}

function initOrder() {
  renderCart();

  let selectedService = "delivery";
  const checkoutPanel = document.getElementById("checkout-panel");

  // mostrar as opções de entrega e pagamento
  document.getElementById("checkout-btn").addEventListener("click", () => {
    if (!getData().cart.length) return;
    checkoutPanel.classList.remove("hidden");
    updateSummary(selectedService);
  });

  document.querySelectorAll("[data-service]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedService = button.dataset.service;
      document.querySelectorAll("[data-service]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      updateSummary(selectedService);
    });
  });

  document.querySelectorAll("[data-payment]").forEach((button) => {
    button.addEventListener("click", () => processPayment(button.dataset.payment, selectedService));
  });
}

function renderCart() {
  const data = getData();
  const list = document.getElementById("cart-items");
  const empty = document.getElementById("empty-cart");
  const checkoutButton = document.getElementById("checkout-btn");

  // Carrinho vazio fica com a mensagem padrão
  if (!data.cart.length) {
    list.innerHTML = "";
    empty.classList.remove("hidden");
    checkoutButton.disabled = true;
    updateSummary("delivery");
    return;
  }

  empty.classList.add("hidden");
  checkoutButton.disabled = false;
  list.innerHTML = data.cart.map((item, index) => `
    <article class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h3>${item.name}</h3>
        <p>Quantidade: ${item.quantity}</p>
        <strong>${formatMoney(item.price)} cada</strong>
      </div>
      <button class="icon-btn remove-item" type="button" data-remove-index="${index}" aria-label="Remover ${item.name}">
        <i class="fa-solid fa-trash"></i>
      </button>
    </article>
  `).join("");

  document.querySelectorAll("[data-remove-index]").forEach((button) => {
    button.addEventListener("click", () => removeCartItem(Number(button.dataset.removeIndex)));
  });

  updateSummary("delivery");
}

function removeCartItem(index) {
  const data = getData();
  data.cart.splice(index, 1);
  saveData(data);
  renderCart();
}

function updateSummary(service) {
  const data = getData();
  const subtotal = cartSubtotal(data.cart);
  const deliveryFee = service === "delivery" && data.cart.length ? 7 : 0;
  document.getElementById("summary-subtotal").textContent = formatMoney(subtotal);
  document.getElementById("summary-delivery").textContent = formatMoney(deliveryFee);
  document.getElementById("summary-total").textContent = formatMoney(subtotal + deliveryFee);
}

function processPayment(payment, service) {
  const data = getData();
  if (!data.cart.length) return;

  // Depois do pagamento o pedido vai para o histórico.
  showLoading("Processando pagamento", "Confirmando a transação", "Pagamento realizado", () => {
    const subtotal = cartSubtotal(data.cart);
    const deliveryFee = service === "delivery" ? 7 : 0;
    data.orders.unshift({
      id: `PED-${Date.now()}`,
      status: service === "pickup" ? "Pedido Retirado" : "Pedido Entregue",
      date: new Date().toLocaleString("pt-BR"),
      items: structuredClone(data.cart),
      service,
      payment,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee
    });
    setUserPoints(data, getUserPoints(data) + 5);
    data.cart = [];
    saveData(data);
    document.getElementById("loading-overlay").classList.add("hidden");
    document.getElementById("checkout-panel").classList.add("hidden");
    document.getElementById("payment-success").classList.remove("hidden");
    renderCart();
  });
}

function initOrders() {
  const data = getData();
  const list = document.getElementById("orders-list");
  const empty = document.getElementById("empty-orders");

  // sem pedidos ainda, mostra só o aviso
  if (!data.orders.length) {
    empty.classList.remove("hidden");
    list.innerHTML = "";
    return;
  }

  empty.classList.add("hidden");
  list.innerHTML = data.orders.map((order) => `
    <article class="order-card">
      <div class="order-head">
        <div>
          <h2>${order.status}</h2>
          <p>${order.date}</p>
        </div>
        <strong>${formatMoney(order.total)}</strong>
      </div>
      <ul>
        ${order.items.map((item) => `<li>${item.quantity}x ${item.name}</li>`).join("")}
      </ul>
    </article>
  `).join("");
}

function initRewards() {
  const data = getData();
  const points = getUserPoints(data);

  // atualiza os pontos visíveis na tela
  document.getElementById("user-points").textContent = points;

  document.querySelectorAll("[data-reward]").forEach((button) => {
    const reward = data.rewards.find((item) => item.id === button.dataset.reward);
    button.disabled = points < reward.cost;
    button.addEventListener("click", () => {
      const confirmed = confirm("O item selecionado será adicionado ao seu pedido e você gastará seus pontos. Deseja continuar?");
      if (confirmed) redeemReward(button.dataset.reward);
    });
  });
}

function redeemReward(rewardId) {
  const data = getData();
  const reward = data.rewards.find((item) => item.id === rewardId);
  const dish = data.dishes.find((item) => item.id === reward.itemId);
  const points = getUserPoints(data);
  if (points < reward.cost) return;

  data.cart.push({
    id: `${dish.id}-reward-${Date.now()}`,
    name: `${dish.name} (Recompensa)`,
    price: 0,
    quantity: 1,
    image: dish.image,
    description: dish.description,
    reward: true
  });
  setUserPoints(data, points - reward.cost);
  saveData(data);
  initRewards();
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  getData();

  if (page === "login") initLogin();
  if (page === "cardapio") initCatalog();
  if (page === "pedido") initOrder();
  if (page === "meus-pedidos") initOrders();
  if (page === "recompensas") initRewards();
});




