const toggleBtn = document.getElementById('theme-toggle');
const html = document.documentElement;
const cart = [];
const ORDERS_KEY = 'cravely_past_orders';

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('cravely-theme', theme);
  toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
}
toggleBtn.onclick = () => setTheme(html.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
setTheme(localStorage.getItem('cravely-theme') || 'light');

const productData = {
  Pizza: [
    { name: "Margherita", price: 199, desc: "Fresh basil and mozzarella" },
    { name: "Farmhouse", price: 249, desc: "Veggies and herbs" },
    { name: "Cheese Burst", price: 299, desc: "Molten cheese inside" },
    { name: "Pepperoni", price: 319, desc: "Spicy pepperoni slices" },
    { name: "Veggie Delight", price: 269, desc: "Garden vegetables" }
  ],
  Burgers: [
    { name: "Classic Veg", price: 99, desc: "Lettuce and tomato" },
    { name: "Double Patty", price: 149, desc: "Double veggie patties" },
    { name: "Cheese Bomb", price: 179, desc: "Extra cheese and pickles" },
    { name: "Spicy Chicken", price: 199, desc: "Grilled spicy chicken" }
  ],
  Desserts: [
    { name: "Brownie", price: 89, desc: "Fudgy chocolate" },
    { name: "Ice Cream Sundae", price: 119, desc: "Cream and cherries" },
    { name: "Chocolate Cake", price: 149, desc: "Cocoa and cream" }
  ],
  Mojitos: [
    { name: "Classic Mojito", price: 149, desc: "Mint and lime" },
    { name: "Strawberry Mojito", price: 169, desc: "Fresh strawberries" },
    { name: "Pineapple Mojito", price: 169, desc: "Pineapple and mint" }
  ]
};

// Handle category click
window.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const category = card.textContent.replace(/[^a-zA-Z ]/g, '').trim();
      const items = productData[category];
      if (!items) return;

      document.getElementById('product-list').style.display = 'block';
      document.getElementById('product-title').textContent = `Popular in ${category}`;
      const container = document.getElementById('products-container');
      container.innerHTML = '';

      items.forEach(item => {
        container.insertAdjacentHTML('beforeend', `
          <div class="product-card">
            <h3>${item.name}</h3>
            <p><em>${item.desc}</em></p>
            <p>₹${item.price}</p>
            <button onclick="addToCart('${item.name}', ${item.price})">Add to Cart</button>
          </div>
        `);
      });
    });
  });
});

function addToCart(name, price) {
  const existing = cart.find(c => c.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  alert(`${name} added to cart!`);
  renderCart(false);
}

function renderCart(scroll = true) {
  const cartSection = document.getElementById('cart-section');
  cartSection.style.display = 'block';

  const itemsDiv = document.getElementById('cart-items');
  itemsDiv.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    itemsDiv.textContent = 'Cart is empty';
  } else {
    cart.forEach((item, index) => {
      total += item.price * item.qty;
      itemsDiv.insertAdjacentHTML('beforeend', `
        <div class="cart-item">
          <span class="item-name">${item.name}</span>
          <span class="item-price">₹${item.price}</span>
          <input type="number" min="1" value="${item.qty}" data-index="${index}" class="qty-input">
          <span class="item-total">= ₹${item.price * item.qty}</span>
          <button data-remove="${index}" class="remove-btn">Remove</button>
        </div>
      `);
    });
  }

  document.getElementById('cart-total').textContent = `Total: ₹${total}`;
  if (scroll) cartSection.scrollIntoView({ behavior: 'smooth' });
}

// Update quantity / remove item
document.getElementById('cart-items').addEventListener('click', e => {
  if (e.target.matches('button[data-remove]')) {
    const index = +e.target.getAttribute('data-remove');
    cart.splice(index, 1);
    renderCart(false);
  }
});

document.getElementById('cart-items').addEventListener('change', e => {
  if (e.target.matches('input[type="number"]')) {
    const index = +e.target.getAttribute('data-index');
    const value = +e.target.value;
    cart[index].qty = value < 1 ? 1 : value;
    renderCart(false);
  }
});

document.getElementById('cart-link').addEventListener('click', e => {
  e.preventDefault();
  renderCart();
});

// Handle checkout form submit
document.getElementById('order-form').addEventListener('submit', function (e) {
  e.preventDefault();
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const order = {
    id: Date.now(),
    items: cart.map(c => ({ ...c })),
    total: cart.reduce((sum, c) => sum + c.qty * c.price, 0),
    customer: {
      name: this.name.value,
      address: this.address.value,
      phone: this.phone.value,
      payment: this.payment.value
    },
    date: new Date().toLocaleString()
  };

  const pastOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  pastOrders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(pastOrders));

  cart.length = 0;
  renderCart(false);
  showOrderSummary(order);
});

function showOrderSummary(order) {
  document.getElementById('order-summary').style.display = 'block';
  const summary = document.getElementById('summary-details');
  summary.innerHTML = `
    <p><strong>Order #${order.id}</strong> (${order.date})</p>
    ${order.items.map(i => `<p>${i.name} × ${i.qty} = ₹${i.qty * i.price}</p>`).join('')}
    <p><strong>Total:</strong> ₹${order.total}</p>
    <p><strong>Name:</strong> ${order.customer.name}</p>
    <p><strong>Address:</strong> ${order.customer.address}</p>
    <p><strong>Phone:</strong> ${order.customer.phone}</p>
    <p><strong>Payment:</strong> ${order.customer.payment}</p>
  `;
}

document.getElementById('summary-back').addEventListener('click', () => {
  document.getElementById('order-summary').style.display = 'none';
  document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
});

// Past orders section
document.getElementById('orders-link').addEventListener('click', e => {
  e.preventDefault();
  const past = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  const section = document.getElementById('orders-section');
  const container = document.getElementById('past-orders');

  section.style.display = 'block';
  if (past.length === 0) {
    container.textContent = 'No past orders.';
  } else {
    container.innerHTML = past.map(o => `
      <div class="order-item">
        <p><strong>Order #${o.id}</strong> (${o.date}) - ₹${o.total}</p>
        <button data-view="${o.id}">View</button>
      </div>
    `).join('');
  }
});

document.getElementById('orders-section').addEventListener('click', e => {
  if (e.target.matches('button[data-view]')) {
    const id = +e.target.getAttribute('data-view');
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    const order = orders.find(o => o.id === id);
    if (order) showOrderSummary(order);
  }
});

document.getElementById('orders-back').addEventListener('click', () => {
  document.getElementById('orders-section').style.display = 'none';
  document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
});
// Product Detail Modal
const modal = document.getElementById('product-modal');
const modalName = document.getElementById('modal-name');
const modalDesc = document.getElementById('modal-desc');
const modalPrice = document.getElementById('modal-price');
const modalAddBtn = document.getElementById('modal-add-btn');
const closeModal = document.getElementById('close-modal');

let selectedItem = null;

document.getElementById('products-container').addEventListener('click', e => {
  const card = e.target.closest('.product-card');
  if (!card || e.target.tagName === 'BUTTON') return;

  const name = card.querySelector('h3').textContent;
  const desc = card.querySelector('em').textContent;
  const priceText = card.querySelector('p:last-of-type').textContent;
  const price = +priceText.replace(/[₹\s]/g, '');

  selectedItem = { name, desc, price };

  modalName.textContent = name;
  modalDesc.textContent = desc;
  modalPrice.textContent = `Price: ₹${price}`;
  modal.style.display = 'block';
});

closeModal.onclick = () => {
  modal.style.display = 'none';
  selectedItem = null;
};

window.onclick = (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
    selectedItem = null;
  }
};

modalAddBtn.onclick = () => {
  if (selectedItem) {
    addToCart(selectedItem.name, selectedItem.price);
    modal.style.display = 'none';
  }
};
// === Product Detail Popup Logic ===
const popup = document.getElementById('product-popup');
const popupTitle = document.getElementById('popup-title');
const popupDesc = document.getElementById('popup-desc');
const popupPrice = document.getElementById('popup-price');
const popupAddBtn = document.getElementById('popup-add-btn');
const popupClose = document.getElementById('popup-close');

let currentPopupItem = null;

function openProductPopup(item) {
  currentPopupItem = item;
  popupTitle.textContent = item.name;
  popupDesc.textContent = item.desc;
  popupPrice.textContent = `Price: ₹${item.price}`;
  popup.style.display = 'flex';
}

popupClose.addEventListener('click', () => {
  popup.style.display = 'none';
});

// Close popup if clicking outside the content
popup.addEventListener('click', e => {
  if (e.target === popup) popup.style.display = 'none';
});

// Add to cart from popup
popupAddBtn.addEventListener('click', () => {
  if (currentPopupItem) {
    addToCart(currentPopupItem.name, currentPopupItem.price);
    popup.style.display = 'none';
  }
});
