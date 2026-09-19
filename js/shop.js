document.addEventListener('DOMContentLoaded', async () => {
  initShopFilters();
  
  // Parse URL params for initial category filter
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category');
  
  if (initialCategory) {
    const radio = document.querySelector(`input[name="category"][value="${initialCategory}"]`);
    if (radio) radio.checked = true;
  }
  
  await loadAndRenderShop();
});

let currentProducts = [];

function initShopFilters() {
  const openBtn = document.getElementById('open-filters-btn');
  const closeBtn = document.getElementById('close-filters-btn');
  const sidebar = document.getElementById('filters-sidebar');
  
  if (openBtn && closeBtn && sidebar) {
    openBtn.addEventListener('click', () => sidebar.classList.add('active'));
    closeBtn.addEventListener('click', () => sidebar.classList.remove('active'));
  }

  // Bind change events
  document.querySelectorAll('input[name="category"]').forEach(radio => {
    radio.addEventListener('change', loadAndRenderShop);
  });
  
  document.getElementById('sort-select').addEventListener('change', renderProducts);
  
  const searchInput = document.getElementById('search-input');
  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      loadAndRenderShop();
    }, 300);
  });
}

async function loadAndRenderShop() {
  const category = document.querySelector('input[name="category"]:checked').value;
  const searchQuery = document.getElementById('search-input').value.trim();
  
  const container = document.getElementById('shop-products-container');
  container.innerHTML = '<p class="text-center text-muted" style="grid-column: 1/-1;">Loading...</p>';
  
  try {
    let products = await window.ProductAPI.searchProducts(searchQuery);
    
    if (category !== 'all') {
      products = products.filter(p => p.category === category);
    }
    
    currentProducts = products;
    renderProducts();
    
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p class="text-center text-error" style="grid-column: 1/-1;">Error loading catalog.</p>';
  }
}

function renderProducts() {
  const container = document.getElementById('shop-products-container');
  const countLabel = document.getElementById('results-count');
  const sortValue = document.getElementById('sort-select').value;
  
  let displayProducts = [...currentProducts];
  
  // Sorting logic
  displayProducts.sort((a, b) => {
    const minPriceA = Math.min(...a.variants.map(v => v.price));
    const minPriceB = Math.min(...b.variants.map(v => v.price));
    
    switch (sortValue) {
      case 'price-low': return minPriceA - minPriceB;
      case 'price-high': return minPriceB - minPriceA;
      case 'name': return a.name.localeCompare(b.name);
      case 'featured': default: return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
  });
  
  countLabel.textContent = `Showing ${displayProducts.length} product(s)`;
  
  if (displayProducts.length === 0) {
    container.innerHTML = `
      <div class="text-center" style="grid-column: 1/-1; padding: var(--space-8) 0;">
        <p class="text-lg">No products found matching your criteria.</p>
        <button class="btn btn-secondary" onclick="document.querySelector('input[value=\\'all\\']').checked=true; document.getElementById('search-input').value=''; loadAndRenderShop();" style="margin-top: var(--space-4);">Clear Filters</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = '';
  
  displayProducts.forEach(product => {
    // Shared card generation logic
    let minPrice = 0;
    let minMrp = 0;
    
    if (product.variants && product.variants.length > 0) {
      minPrice = product.variants[0].price;
      minMrp = product.variants[0].mrp;
      product.variants.forEach(v => {
        if (v.price < minPrice) {
          minPrice = v.price;
          minMrp = v.mrp;
        }
      });
    }
    
    const discount = window.ProductAPI.calculateDiscount(minMrp, minPrice);
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '';
    const imageHtml = imageUrl 
      ? `<img src="${imageUrl}" alt="${product.name}" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100%25\\' height=\\'100%25\\' viewBox=\\'0 0 100 100\\'%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' fill=\\'%23DFBC93\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' font-family=\\'sans-serif\\' font-size=\\'10\\' fill=\\'%231F3F2F\\'%3EOsaara Naturals%3C/text%3E%3C/svg%3E';">`
      : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--color-bg-light); color: var(--color-primary-dark); font-family: var(--font-heading); padding: 1rem; text-align: center;">${product.name}</div>`;

    const card = document.createElement('a');
    card.href = `product.html?id=${product.id}`;
    card.className = 'product-card';
    card.innerHTML = `
      <div class="image-wrapper">
        ${imageHtml}
      </div>
      <div class="content">
        <span class="category">${product.category}</span>
        <h3 class="title">${product.name}</h3>
        <div class="price-row">
          <span class="price">${window.formatPrice(minPrice)}</span>
          ${minMrp > minPrice ? `<span class="mrp">${window.formatPrice(minMrp)}</span>` : ''}
          ${discount > 0 ? `<span class="discount">${discount}% OFF</span>` : ''}
        </div>
        <button class="add-to-cart-btn">View Product</button>
      </div>
    `;
    container.appendChild(card);
  });
}
