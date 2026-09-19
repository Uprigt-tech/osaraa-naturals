const WhatsAppAPI = {
  // Format single product directly from product page
  checkoutSingleProduct: function(product, variant, quantity) {
    const config = window.SITE_CONFIG;
    if (!config) return;
    
    const total = variant.price * quantity;
    
    let message = `Hello ${config.brand},\n\n`;
    message += `I would like to place an order:\n\n`;
    
    message += `*${product.name}*\n`;
    message += `Weight: ${variant.weight}\n`;
    message += `Quantity: ${quantity}\n`;
    message += `Price: ${config.currency}${variant.price}\n\n`;
    
    message += `*Total: ${config.currency}${total}*\n\n`;
    message += `Please confirm availability and order details.`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${config.whatsapp}?text=${encodedMessage}`, '_blank');
  },
  
  // Format full cart checkout
  checkoutCart: function() {
    const config = window.SITE_CONFIG;
    if (!config || !window.CartAPI) return;
    
    const cart = window.CartAPI.getCart();
    if (cart.length === 0) return;
    
    let message = `Hello ${config.brand},\n\n`;
    message += `I would like to place an order:\n\n`;
    
    cart.forEach(item => {
      message += `*${item.name}*\n`;
      message += `Weight: ${item.weight}\n`;
      message += `Quantity: ${item.quantity}\n`;
      message += `Price: ${config.currency}${item.price}\n\n`;
    });
    
    const total = window.CartAPI.getTotal();
    message += `*Total: ${config.currency}${total}*\n\n`;
    message += `Please confirm availability and order details.`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${config.whatsapp}?text=${encodedMessage}`, '_blank');
  }
};

window.WhatsAppAPI = WhatsAppAPI;
