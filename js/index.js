document.addEventListener('DOMContentLoaded', async () => {
  populateConfigData();
  await renderFeaturedProducts();
});

function populateConfigData() {
  const config = window.SITE_CONFIG;
  if (!config) return;

  // Set Registrations
  document.getElementById('fssai-number').textContent = `FSSAI: ${config.registrations.fssai}`;
  document.getElementById('msme-number').textContent = `UDYAM: ${config.registrations.msme}`;
  
  // Set Footer Info
  document.getElementById('footer-phone').textContent = `Phone: ${config.phone}`;
  
  const waLink = document.getElementById('footer-whatsapp');
  waLink.textContent = `WhatsApp: ${config.whatsapp}`;
  waLink.href = `https://wa.me/${config.whatsapp}`;
  
  const igLink = document.getElementById('footer-instagram');
  igLink.textContent = `Instagram: ${config.instagram}`;
  igLink.href = `https://instagram.com/${config.instagram.replace('@', '')}`;
  
  document.getElementById('footer-fssai').textContent = `FSSAI: ${config.registrations.fssai}`;
  document.getElementById('footer-msme').textContent = `MSME: ${config.registrations.msme}`;
  
  document.getElementById('current-year').textContent = new Date().getFullYear();
}

async function renderFeaturedProducts() {
  const container = document.getElementById('featured-products-container');
  if (!container) return;

  try {
    const featuredProducts = await window.ProductAPI.getFeaturedProducts();
    
    if (!featuredProducts || featuredProducts.length === 0) {
      container.innerHTML = '<p class="text-center text-muted" style="grid-column: 1/-1;">No featured products available at the moment.</p>';
      return;
    }
    
    container.innerHTML = ''; // Clear loading text
    
    featuredProducts.forEach(product => {
      // Find lowest price to display "From ₹XX"
      let minPrice = 0;
      let minMrp = 0;
      let hasDiscount = false;
      
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
      
      // Fallback placeholder image logic if image is not accessible
      const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '';
      const imageHtml = imageUrl 
        ? `<img src="${imageUrl}" alt="${product.name}" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100%25\\' height=\\'100%25\\' viewBox=\\'0 0 100 100\\'%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' fill=\\'%23DFBC93\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' font-family=\\'sans-serif\\' font-size=\\'10\\' fill=\\'%231F3F2F\\'%3EOsaara Naturals%3C/text%3E%3C/svg%3E';">`
        : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--color-bg-light); color: var(--color-primary-dark); font-family: var(--font-heading); font-size: 1rem; padding: 1rem; text-align: center;">${product.name}</div>`;

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
    
  } catch (error) {
    console.error("Failed to render featured products", error);
    container.innerHTML = '<p class="text-center text-error" style="grid-column: 1/-1;">Error loading products.</p>';
  }
}
