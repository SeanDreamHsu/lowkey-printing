// ========================================
// TEEN DESIGN - Interactive Features
// ========================================

// Product data - Fetched from API
let products = [];

let editingProductId = null;

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initSmoothScroll();
  initContactForm();
  initNavbarScroll();
  initScrollAnimations();
  initAdminPanel();
  fetchProducts(); // Fetch from Cloud
  initMagicBento();
});

async function fetchProducts() {
  try {
    const response = await fetch('/api/products');
    if (response.ok) {
      products = await response.json();
      // Fallback for empty database
      if (products.length === 0) {
        products = [
          { id: 1, name: 'Gaming Controller Stand', desc: 'Keep your controllers organized in style', price: 12, emoji: '🎮', image: '', badge: 'popular' },
          { id: 2, name: 'Articulated Dragon', desc: 'Fully movable joints, multiple colors', price: 18, emoji: '🐉', image: '', badge: 'new' },
          { id: 3, name: 'Phone Stand', desc: 'Adjustable angle, fits all phones', price: 8, emoji: '📱', image: '', badge: '' },
          { id: 4, name: 'Pencil Holder', desc: 'Geometric design, desk essential', price: 6, emoji: '🎨', image: '', badge: '' },
          { id: 5, name: 'Custom Keychain', desc: 'Personalized with your name or design', price: 5, emoji: '🔑', image: '', badge: '' }
        ];
        // Save defaults to cloud
        saveProducts();
      }
    }
  } catch (error) {
    console.error('Failed to fetch products:', error);
    // Fallback to localStorage if offline
    products = JSON.parse(localStorage.getItem('lowkeyProducts')) || [];
  }
  renderProducts();
}

// ========================================
// Render Products from Data
// ========================================
function renderProducts() {
  const grid = document.querySelector('.products-grid');
  if (!grid) return;

  // Clear existing products except the custom card
  const customCard = grid.querySelector('.custom-card');
  grid.innerHTML = '';

  products.forEach(product => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.id = product.id;

    const badgeHtml = product.badge ?
      `<span class="product-badge ${product.badge === 'new' ? 'new' : ''}">${product.badge === 'new' ? 'New' : 'Popular'}</span>` : '';

    const primaryImage = (product.images && product.images.length > 0) ? product.images[0] : product.image;

    const imageHtml = primaryImage ?
      `<img src="${primaryImage}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">` :
      `<span>${product.emoji || '📦'}</span>`;

    card.innerHTML = `
      <div class="product-image">
        <div class="product-placeholder">${imageHtml}</div>
        ${badgeHtml}
      </div>
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <p class="product-desc">${product.desc}</p>
        <div class="product-footer">
          <span class="product-price">$${product.price.toFixed(2)}</span>
          <button class="btn btn-small">Order</button>
        </div>
      </div>
    `;

    // Make whole card clickable
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      // Don't trigger if user selected text
      if (window.getSelection().toString()) return;
      window.location.href = `product.html?id=${product.id}`;
    });

    grid.appendChild(card);
  });

  // Re-add custom card
  if (customCard) {
    grid.appendChild(customCard);
  } else {
    const newCustomCard = document.createElement('article');
    newCustomCard.className = 'product-card custom-card';
    newCustomCard.innerHTML = `
      <div class="product-image">
        <div class="product-placeholder custom">
          <span>✨</span>
          <p>Your Idea Here</p>
        </div>
      </div>
      <div class="product-info">
        <h3 class="product-title">Custom Print</h3>
        <p class="product-desc">Got a design in mind? Let's make it!</p>
        <div class="product-footer">
          <span class="product-price">Quote</span>
          <a href="#contact" class="btn btn-small">Contact Us</a>
        </div>
      </div>
    `;
    grid.appendChild(newCustomCard);
  }

  // Re-attach order button handlers

  saveProducts();
}

async function saveProducts() {
  // Always save to local as backup/cache
  localStorage.setItem('lowkeyProducts', JSON.stringify(products));

  // Save to Cloud
  try {
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products)
    });
  } catch (error) {
    console.error('Failed to save to cloud:', error);
  }
}

// ========================================
// Admin Panel
// ========================================
const ADMIN_PASSWORD = 'lowkey2026'; // Change this password!

function initAdminPanel() {
  const adminBtn = document.getElementById('adminBtn');
  const adminModal = document.getElementById('adminModal');
  const closeAdmin = document.getElementById('closeAdmin');
  const editProductModal = document.getElementById('editProductModal');
  const closeEditModal = document.getElementById('closeEditModal');

  // Check if already verified
  if (localStorage.getItem('admin_verified') === 'true') {
    if (adminBtn) adminBtn.style.display = 'block';
  }

  // Secret keyboard shortcut to unlock admin: Ctrl + Shift + L (Lowkey)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
      const password = prompt('🔒 Admin Setup: Enter password to enable admin features on this device:');
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem('admin_verified', 'true');
        alert('✅ Device verified! Admin button is now visible.');
        if (adminBtn) adminBtn.style.display = 'block';
      } else if (password !== null) {
        alert('❌ Wrong password');
      }
    }
  });

  // Open admin panel
  adminBtn?.addEventListener('click', () => {
    adminModal.classList.add('active');
    populateEditList();
  });

  // Close admin panel
  closeAdmin?.addEventListener('click', () => {
    adminModal.classList.remove('active');
  });

  // Close edit modal
  closeEditModal?.addEventListener('click', () => {
    editProductModal.classList.remove('active');
  });

  // Close on overlay click
  adminModal?.addEventListener('click', (e) => {
    if (e.target === adminModal) adminModal.classList.remove('active');
  });

  editProductModal?.addEventListener('click', (e) => {
    if (e.target === editProductModal) editProductModal.classList.remove('active');
  });

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
      if (btn.dataset.tab === 'edit') populateEditList();
    });
  });

  // Add product form
  document.getElementById('addProductForm')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const newProduct = {
      id: Date.now(),
      name: document.getElementById('newProductName').value,
      desc: document.getElementById('newProductDesc').value || 'Amazing 3D print',
      price: parseFloat(document.getElementById('newProductPrice').value),
      emoji: document.getElementById('newProductEmoji').value || '📦',
      image: document.getElementById('newProductImage').value || '',
      images: document.getElementById('newProductImage').value ? [document.getElementById('newProductImage').value] : [],
      badge: document.getElementById('newProductBadge').value
    };

    products.push(newProduct);
    renderProducts();
    saveProducts();
    e.target.reset();

    // Show success feedback
    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = '✓ Added!';
    btn.style.background = '#22c55e';
    setTimeout(() => {
      btn.textContent = 'Add Product';
      btn.style.background = '';
    }, 2000);
  });

  // Edit Product Form Submit
  document.getElementById('editProductForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (editingProductId === null) return;

    const name = document.getElementById('editProductName').value;
    const desc = document.getElementById('editProductDesc').value;
    const price = parseFloat(document.getElementById('editProductPrice').value);
    const emoji = document.getElementById('editProductEmoji').value;
    const badge = document.getElementById('editProductBadge').value;
    const imagesText = document.getElementById('editProductImages').value;

    // Process images
    const images = imagesText.split('\n').map(url => url.trim()).filter(url => url.length > 0);

    const product = products.find(p => p.id === editingProductId);
    if (product) {
      product.name = name;
      product.desc = desc;
      product.price = price;
      product.emoji = emoji;
      product.badge = badge;
      product.images = images;
      product.image = images.length > 0 ? images[0] : ''; // Fallback for backward compatibility

      renderProducts();
      populateEditList();
      saveProducts();
    }

    editProductModal.classList.remove('active');
  });

  // Delete Product Button
  document.getElementById('deleteProductBtn')?.addEventListener('click', () => {
    if (editingProductId === null || !confirm('Are you sure you want to delete this product?')) return;

    products = products.filter(p => p.id !== editingProductId);
    renderProducts();
    populateEditList();
    saveProducts();
    editProductModal.classList.remove('active');
  });
}

function populateEditList() {
  const list = document.getElementById('editProductsList');
  if (!list) return;

  list.innerHTML = products.map(p => `
    <div class="edit-product-item" data-id="${p.id}">
      <div class="edit-product-thumb">
        ${(p.images && p.images.length > 0) ? `<img src="${p.images[0]}" alt="${p.name}">` : (p.image ? `<img src="${p.image}" alt="${p.name}">` : p.emoji || '📦')}
      </div>
      <div class="edit-product-info">
        <h4>${p.name}</h4>
        <p>$${p.price.toFixed(2)}</p>
      </div>
      <span class="edit-product-action">Edit →</span>
    </div>
  `).join('');

  // Add click handlers
  list.querySelectorAll('.edit-product-item').forEach(item => {
    item.addEventListener('click', () => {
      editingProductId = parseInt(item.dataset.id);
      const product = products.find(p => p.id === editingProductId);
      if (product) {
        document.getElementById('editProductId').value = product.id;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductDesc').value = product.desc;
        document.getElementById('editProductPrice').value = product.price;
        document.getElementById('editProductEmoji').value = product.emoji || '';
        document.getElementById('editProductBadge').value = product.badge || '';

        // Populate images textarea
        const imagesList = (product.images && product.images.length > 0) ? product.images : (product.image ? [product.image] : []);
        document.getElementById('editProductImages').value = imagesList.join('\n');

        document.getElementById('editProductModal').classList.add('active');
      }
    });
  });
}

// ========================================
// Mobile Menu
// ========================================
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.querySelector('.nav-links');

  if (!mobileMenuBtn || !navLinks) return;

  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      mobileMenuBtn.classList.remove('active');
    });
  });
}

// ========================================
// Smooth Scroll
// ========================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    });
  });
}

// ========================================
// Contact Form
// ========================================
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Initialize address field visibility
  toggleAddressField();

  // Check for pending order from product page
  const pendingOrder = sessionStorage.getItem('pendingOrder');
  if (pendingOrder) {
    try {
      const order = JSON.parse(pendingOrder);
      const messageField = document.getElementById('message');
      const subjectField = document.getElementById('subject');
      const addressField = document.getElementById('address');

      if (messageField && order.message) {
        messageField.value = order.message;
      }
      if (subjectField) {
        subjectField.value = 'order';
        toggleAddressField();
      }
      if (addressField && order.address) {
        addressField.value = order.address;
      }

      // Clear the pending order
      sessionStorage.removeItem('pendingOrder');
    } catch (e) {
      console.error('Error parsing pending order:', e);
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Submit to Web3Forms
    const formData = new FormData(form);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        submitBtn.textContent = '✓ Message Sent!';
        submitBtn.style.background = '#22c55e';
        form.reset();
        toggleAddressField();
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      submitBtn.textContent = '❌ Error - Try Again';
      submitBtn.style.background = '#ef4444';
    }

    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.style.background = '';
      submitBtn.disabled = false;
    }, 3000);
  });
}

// Toggle address field based on subject selection
function toggleAddressField() {
  const subject = document.getElementById('subject');
  const addressGroup = document.getElementById('addressGroup');
  if (subject && addressGroup) {
    // Show for order and custom, hide for question
    addressGroup.style.display = subject.value === 'question' ? 'none' : 'block';
  }
}

// Make toggleAddressField globally accessible for inline onchange
window.toggleAddressField = toggleAddressField;

// ========================================
// Navbar Scroll Effect
// ========================================
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
      navbar.style.background = 'rgba(10, 10, 15, 0.95)';
    } else {
      navbar.style.background = 'rgba(10, 10, 15, 0.8)';
    }
  });
}

// ========================================
// Scroll Animations
// ========================================
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.product-card, .printer-card, .info-card, .about-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ========================================
// Product Order Buttons
// ========================================


// ========================================
// Mobile menu CSS injection
// ========================================
const style = document.createElement('style');
style.textContent = `
  @media (max-width: 768px) {
    .nav-links.active {
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: rgba(10, 10, 15, 0.98);
      padding: var(--space-lg);
      gap: var(--space-md);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .mobile-menu-btn.active span:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }
    
    .mobile-menu-btn.active span:nth-child(2) {
      opacity: 0;
    }
    
    .mobile-menu-btn.active span:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -5px);
    }
  }
`;
document.head.appendChild(style);

// ========================================
// Magic Bento Glow Effect
// ========================================
function initMagicBento() {
  const cards = document.querySelectorAll('.product-card, .printer-card, .info-card, .about-card');
  const spotlightRadius = 300;
  const lerpFactor = 0.15; // Smoothing factor (0-1, lower = smoother)

  // Store current values for smooth interpolation
  const cardStates = new Map();

  cards.forEach(card => {
    card.classList.add('magic-card');
    cardStates.set(card, {
      currentIntensity: 0,
      targetIntensity: 0,
      currentX: 50,
      currentY: 50,
      targetX: 50,
      targetY: 50
    });
  });

  // Lerp function for smooth transitions
  function lerp(current, target, factor) {
    return current + (target - current) * factor;
  }

  // Animation loop for smooth updates
  function animate() {
    cards.forEach(card => {
      const state = cardStates.get(card);
      if (!state) return;

      // Smoothly interpolate values
      state.currentIntensity = lerp(state.currentIntensity, state.targetIntensity, lerpFactor);
      state.currentX = lerp(state.currentX, state.targetX, lerpFactor * 1.5);
      state.currentY = lerp(state.currentY, state.targetY, lerpFactor * 1.5);

      // Round to avoid sub-pixel jitter
      const intensity = Math.round(state.currentIntensity * 1000) / 1000;

      card.style.setProperty('--glow-x', `${state.currentX}%`);
      card.style.setProperty('--glow-y', `${state.currentY}%`);
      card.style.setProperty('--glow-intensity', intensity.toString());
    });

    requestAnimationFrame(animate);
  }

  animate();

  // Global mouse tracking for proximity effect
  document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const state = cardStates.get(card);
      if (!state) return;

      // Calculate center of card
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Distance from mouse to card center, minus half the card size
      const distanceToCenter = Math.hypot(mouseX - centerX, mouseY - centerY);
      const cardRadius = Math.max(rect.width, rect.height) / 2;
      const effectiveDistance = Math.max(0, distanceToCenter - cardRadius);

      // Calculate glow intensity based on distance
      let glowIntensity = 0;
      if (effectiveDistance <= spotlightRadius * 0.5) {
        glowIntensity = 1;
      } else if (effectiveDistance <= spotlightRadius) {
        glowIntensity = (spotlightRadius - effectiveDistance) / (spotlightRadius * 0.5);
      }

      // Calculate relative position as percentage
      const relativeX = ((mouseX - rect.left) / rect.width) * 100;
      const relativeY = ((mouseY - rect.top) / rect.height) * 100;

      // Clamp percentage to reasonable range
      state.targetX = Math.max(-50, Math.min(150, relativeX));
      state.targetY = Math.max(-50, Math.min(150, relativeY));
      state.targetIntensity = glowIntensity;
    });
  });

  document.addEventListener('mouseleave', () => {
    cards.forEach(card => {
      const state = cardStates.get(card);
      if (state) {
        state.targetIntensity = 0;
      }
    });
  });
}

initMagicBento();

