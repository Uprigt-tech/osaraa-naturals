const SITE_CONFIG = {
  brand: "OSAARA NATURALS",
  whatsapp: "6382301828",
  phone: "9487986825",
  instagram: "@OSAARAANATURALS",
  currency: "₹",
  demoMode: true,
  registrations: {
    fssai: "22425473000026",
    msme: "UDYAM-TN-23-0012523"
  }
};

// Expose globally for utility scripts
window.SITE_CONFIG = SITE_CONFIG;

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  updateCartCountBadge();
});

function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const closeBtn = document.querySelector('.mobile-menu-close');
  const menu = document.querySelector('.mobile-menu');

  if (toggleBtn && closeBtn && menu) {
    toggleBtn.addEventListener('click', () => {
      menu.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    });

    closeBtn.addEventListener('click', () => {
      menu.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
}

// Simple function to format price
function formatPrice(amount) {
  return `${SITE_CONFIG.currency}${amount.toLocaleString('en-IN')}`;
}

// Mock function for now, will be overridden/implemented fully in cart.js
function updateCartCountBadge() {
  const counts = document.querySelectorAll('.cart-count');
  const cart = JSON.parse(localStorage.getItem('osaara_cart')) || [];
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  counts.forEach(badge => {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
  });
}

window.formatPrice = formatPrice;
window.updateCartCountBadge = updateCartCountBadge;
