const PRODUCT_FILES = [
  'traditional-health-mix.json',
  'shikakai-herbal-powder.json',
  'natural-face-powder.json',
  'everyday-wellness-combo.json'
];

// Simple in-memory cache
let productsCache = null;

/**
 * Fetches all product JSONs and caches them.
 * @returns {Promise<Array>} Array of product objects
 */
async function getAllProducts() {
  if (productsCache) {
    return productsCache;
  }

  try {
    const fetchPromises = PRODUCT_FILES.map(file => 
      fetch(`/products/${file}`)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to load ${file}`);
          return res.json();
        })
    );

    productsCache = await Promise.all(fetchPromises);
    return productsCache;
  } catch (error) {
    console.error("Error loading products:", error);
    return [];
  }
}

/**
 * Gets a single product by its ID/Slug
 * @param {string} id 
 * @returns {Promise<Object|null>}
 */
async function getProductById(id) {
  const products = await getAllProducts();
  return products.find(p => p.id === id || p.slug === id) || null;
}

/**
 * Gets products matching a specific category
 * @param {string} category 
 * @returns {Promise<Array>}
 */
async function getProductsByCategory(category) {
  const products = await getAllProducts();
  return products.filter(p => p.category === category);
}

/**
 * Gets featured products
 * @returns {Promise<Array>}
 */
async function getFeaturedProducts() {
  const products = await getAllProducts();
  return products.filter(p => p.featured);
}

/**
 * Searches products by name or ingredients
 * @param {string} query 
 * @returns {Promise<Array>}
 */
async function searchProducts(query) {
  if (!query) return await getAllProducts();
  
  const lowerQuery = query.toLowerCase();
  const products = await getAllProducts();
  
  return products.filter(p => {
    const matchName = p.name.toLowerCase().includes(lowerQuery);
    const matchDesc = p.shortDescription.toLowerCase().includes(lowerQuery);
    const matchCategory = p.category.toLowerCase().includes(lowerQuery);
    const matchIngredient = p.ingredients && p.ingredients.some(i => i.toLowerCase().includes(lowerQuery));
    
    return matchName || matchDesc || matchCategory || matchIngredient;
  });
}

// Helper to calculate discount percentage
function calculateDiscount(mrp, price) {
  if (!mrp || !price || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

window.ProductAPI = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts,
  calculateDiscount
};
