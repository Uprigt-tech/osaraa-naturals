const CART_STORAGE_KEY = 'osaara_cart';

// Base Cart API
const CartAPI = {
  getCart: function() {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Cart read error", e);
      return [];
    }
  },
  
  saveCart: function(cart) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      if (window.updateCartCountBadge) {
        window.updateCartCountBadge();
      }
    } catch (e) {
      console.error("Cart save error", e);
    }
  },
  
  addItem: function(product, variant, quantity) {
    const cart = this.getCart();
    
    // Check if exactly this product+variant is already in cart
    const existingIndex = cart.findIndex(item => item.id === product.id && item.weight === variant.weight);
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        weight: variant.weight,
        price: variant.price,
        quantity: quantity
      });
    }
    
    this.saveCart(cart);
  },
  
  updateQuantity: function(index, quantity) {
    const cart = this.getCart();
    if (index >= 0 && index < cart.length) {
      if (quantity > 0) {
        cart[index].quantity = quantity;
      } else {
        cart.splice(index, 1);
      }
      this.saveCart(cart);
    }
  },
  
  removeItem: function(index) {
    const cart = this.getCart();
    if (index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      this.saveCart(cart);
    }
  },
  
  clearCart: function() {
    this.saveCart([]);
  },
  
  getTotal: function() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
};

window.CartAPI = CartAPI;
