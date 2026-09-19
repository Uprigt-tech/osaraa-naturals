document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (!productId) {
    showError('Product not found in URL.');
    return;
  }
  
  const product = await window.ProductAPI.getProductById(productId);
  
  if (!product) {
    showError('Product not found.');
    return;
  }
  
  renderProduct(product);
  
  // Update document metadata for SEO
  document.title = `${product.name} | OSAARA NATURALS`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = product.shortDescription;
});

let currentProduct = null;
let selectedVariantIndex = 0;
let currentQuantity = 1;

function showError(msg) {
  const container = document.getElementById('product-content');
  container.innerHTML = `
    <div class="error-state">
      <h2>${msg}</h2>
      <p class="text-muted" style="margin-top: 1rem;">The requested product could not be loaded.</p>
      <a href="shop.html" class="btn btn-primary" style="margin-top: 2rem;">Back to Shop</a>
    </div>
  `;
}

function renderProduct(product) {
  currentProduct = product;
  const container = document.getElementById('product-content');
  
  // Fallback image logic
  const mainImageUrl = product.images && product.images.length > 0 ? product.images[0] : '';
  const mainImageHtml = mainImageUrl 
    ? `<img id="main-product-image" src="${mainImageUrl}" alt="${product.name}" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100%25\\' height=\\'100%25\\' viewBox=\\'0 0 100 100\\'%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' fill=\\'%23DFBC93\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' font-family=\\'sans-serif\\' font-size=\\'10\\' fill=\\'%231F3F2F\\'%3EOsaara Naturals%3C/text%3E%3C/svg%3E';">`
    : `<div id="main-product-image" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--color-bg-light); color: var(--color-primary-dark); font-family: var(--font-heading); font-size: 1.5rem; padding: 1rem; text-align: center;">${product.name}</div>`;

  let thumbnailsHtml = '';
  if (product.images && product.images.length > 1) {
    thumbnailsHtml = `
      <div class="product-thumbnails" style="display: flex; gap: var(--space-2); overflow-x: auto; padding-bottom: var(--space-2); margin-top: var(--space-2);">
        ${product.images.map((img, i) => `
          <div class="thumbnail ${i === 0 ? 'active' : ''}" style="width: 80px; height: 80px; flex-shrink: 0; cursor: pointer; border-radius: var(--radius-sm); overflow: hidden; border: 2px solid ${i === 0 ? 'var(--color-primary)' : 'transparent'};" data-img="${img}">
            <img src="${img}" style="width: 100%; height: 100%; object-fit: cover;" alt="Thumbnail ${i+1}">
          </div>
        `).join('')}
      </div>
    `;
  }

  // Build Weights HTML
  let weightsHtml = '';
  if (product.variants && product.variants.length > 0) {
    weightsHtml = product.variants.map((v, index) => 
      `<button class="weight-btn ${index === selectedVariantIndex ? 'selected' : ''}" data-index="${index}">${v.weight}</button>`
    ).join('');
  }
  
  container.innerHTML = `
    <div class="breadcrumb">
      <a href="index.html">Home</a> &gt; 
      <a href="shop.html">Shop</a> &gt; 
      <a href="shop.html?category=${encodeURIComponent(product.category)}">${product.category}</a> &gt; 
      <span>${product.name}</span>
    </div>

    <div class="product-main">
      <div class="product-gallery">
        <div class="main-image">
          ${mainImageHtml}
        </div>
        ${thumbnailsHtml}
      </div>
      
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <h1 class="product-title">${product.name}</h1>
        <p class="product-description-short">${product.shortDescription}</p>
        
        <div class="product-pricing" id="price-container">
          <!-- Populated dynamically based on selected variant -->
        </div>
        
        <div class="option-group">
          <span class="option-label">Weight</span>
          <div class="weight-options" id="weight-selector">
            ${weightsHtml}
          </div>
        </div>
        
        <div class="option-group">
          <span class="option-label">Quantity</span>
          <div class="quantity-selector">
            <button class="qty-btn" id="qty-minus">-</button>
            <input type="number" class="qty-input" id="qty-input" value="1" min="1" max="10">
            <button class="qty-btn" id="qty-plus">+</button>
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="btn btn-primary btn-block" id="btn-add-cart">Add to Cart</button>
          <button class="btn btn-accent btn-block" id="btn-buy-now">Buy Now on WhatsApp</button>
        </div>
      </div>
    </div>
    
    <div class="details-section">
      <div class="detail-grid">
        <div class="detail-main">
          <div class="detail-block">
            <h3>Description</h3>
            <p>${product.description}</p>
          </div>
          
          ${product.ingredients && product.ingredients.length > 0 ? `
          <div class="detail-block">
            <h3>Ingredients</h3>
            <ul>
              ${product.ingredients.map(i => `<li>${i}</li>`).join('')}
            </ul>
          </div>` : ''}
          
          ${product.benefits && product.benefits.length > 0 ? `
          <div class="detail-block">
            <h3>Benefits</h3>
            <ul>
              ${product.benefits.map(i => `<li>${i}</li>`).join('')}
            </ul>
          </div>` : ''}
          
          ${product.howToUse && product.howToUse.length > 0 ? `
          <div class="detail-block">
            <h3>How to Use</h3>
            <ul>
              ${product.howToUse.map(i => `<li>${i}</li>`).join('')}
            </ul>
          </div>` : ''}
        </div>
        
        <div class="detail-meta">
          <div class="meta-card">
            ${product.suitableFor && product.suitableFor.length > 0 ? `
            <div class="meta-item">
              <strong>Suitable For</strong>
              <span>${product.suitableFor.join(', ')}</span>
            </div>` : ''}
            
            ${product.manufacturingMethod ? `
            <div class="meta-item">
              <strong>Preparation</strong>
              <span>${product.manufacturingMethod}</span>
            </div>` : ''}
            
            ${product.shelfLife ? `
            <div class="meta-item">
              <strong>Shelf Life</strong>
              <span>${product.shelfLife}</span>
            </div>` : ''}
            
            ${product.storageInstructions ? `
            <div class="meta-item">
              <strong>Storage</strong>
              <span>${product.storageInstructions}</span>
            </div>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Attach Event Listeners
  attachVariantListeners();
  attachQuantityListeners();
  attachActionListeners();
  attachGalleryListeners();
  
  // Initial price render
  updatePriceDisplay();
}

function attachGalleryListeners() {
  const thumbnails = document.querySelectorAll('.thumbnail');
  const mainImage = document.getElementById('main-product-image');

  if (!mainImage) return;

  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const newSrc = thumb.getAttribute('data-img');
      if (!newSrc || mainImage.src.endsWith(newSrc)) return;

      // Update active state
      thumbnails.forEach(t => {
        t.classList.remove('active');
        t.style.borderColor = 'transparent';
      });
      thumb.classList.add('active');
      thumb.style.borderColor = 'var(--color-primary-dark)';

      // Crossfade transition (works in tandem with animations.css)
      mainImage.classList.add('is-fading');
      setTimeout(() => {
        mainImage.src = newSrc;
        mainImage.classList.remove('is-fading');
      }, 220);
    });
  });
}

function attachVariantListeners() {
  const buttons = document.querySelectorAll('.weight-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Remove selected class from all
      buttons.forEach(b => b.classList.remove('selected'));
      // Add to clicked
      e.target.classList.add('selected');
      // Update state
      selectedVariantIndex = parseInt(e.target.getAttribute('data-index'), 10);
      updatePriceDisplay();
    });
  });
}

function updatePriceDisplay() {
  const container = document.getElementById('price-container');
  if (!currentProduct.variants || currentProduct.variants.length === 0) return;
  
  const variant = currentProduct.variants[selectedVariantIndex];
  const discount = window.ProductAPI.calculateDiscount(variant.mrp, variant.price);
  
  container.innerHTML = `
    <span class="price-current">${window.formatPrice(variant.price)}</span>
    ${variant.mrp > variant.price ? `<span class="price-mrp">${window.formatPrice(variant.mrp)}</span>` : ''}
    ${discount > 0 ? `<span class="price-discount">${discount}% OFF</span>` : ''}
  `;
}

function attachQuantityListeners() {
  const minus = document.getElementById('qty-minus');
  const plus = document.getElementById('qty-plus');
  const input = document.getElementById('qty-input');
  
  minus.addEventListener('click', () => {
    if (currentQuantity > 1) {
      currentQuantity--;
      input.value = currentQuantity;
    }
  });
  
  plus.addEventListener('click', () => {
    if (currentQuantity < 10) {
      currentQuantity++;
      input.value = currentQuantity;
    }
  });
  
  input.addEventListener('change', (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 10) val = 10;
    currentQuantity = val;
    input.value = currentQuantity;
  });
}

function attachActionListeners() {
  const btnAddCart = document.getElementById('btn-add-cart');
  const btnBuyNow = document.getElementById('btn-buy-now');
  
  btnAddCart.addEventListener('click', () => {
    if (window.CartAPI) {
      const variant = currentProduct.variants[selectedVariantIndex];
      window.CartAPI.addItem(currentProduct, variant, currentQuantity);
      
      // Visual feedback
      const originalText = btnAddCart.innerText;
      btnAddCart.innerText = "Added to Cart!";
      btnAddCart.style.backgroundColor = "var(--color-success)";
      btnAddCart.style.borderColor = "var(--color-success)";
      
      setTimeout(() => {
        btnAddCart.innerText = originalText;
        btnAddCart.style.backgroundColor = "";
        btnAddCart.style.borderColor = "";
      }, 2000);
    }
  });
  
  btnBuyNow.addEventListener('click', () => {
    if (window.WhatsAppAPI) {
      const variant = currentProduct.variants[selectedVariantIndex];
      window.WhatsAppAPI.checkoutSingleProduct(currentProduct, variant, currentQuantity);
    }
  });
}
