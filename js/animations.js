/* ================================================== */
/* OSAARA NATURALS — Motion System JS                 */
/* ================================================== */

(function () {
  'use strict';

  const isMobile = () => window.innerWidth < 768;

  /* ========================= */
  /* 1. Header Scroll Effect   */
  /* ========================= */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ========================= */
  /* 2. Scroll Reveal Observer */
  /* ========================= */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
  });

  /* ========================= */
  /* 3. Product Card Reveal    */
  /* ========================= */
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.revealDelay || '0', 10);
        setTimeout(() => entry.target.classList.add('is-visible'), delay);
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

  function observeProductCards() {
    document.querySelectorAll('.product-card:not([data-motion-observed])').forEach((card, i) => {
      card.setAttribute('data-motion-observed', '1');
      card.setAttribute('data-reveal-delay', String(i * 80));
      card.classList.add('reveal-up');
      cardObserver.observe(card);
    });
  }

  // Observe cards already in DOM
  observeProductCards();

  // Observe cards injected later by JS
  document.querySelectorAll('.product-grid, #featured-products-container, #shop-products-container').forEach(grid => {
    const mo = new MutationObserver(observeProductCards);
    mo.observe(grid, { childList: true });
  });

  /* ========================= */
  /* 4. Image Fade On Load     */
  /* ========================= */
  function initImageFade(root) {
    root = root || document;
    root.querySelectorAll('img:not([data-fade-init])').forEach(img => {
      img.setAttribute('data-fade-init', '1');
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('img-loaded');
      } else {
        img.addEventListener('load',  () => img.classList.add('img-loaded'));
        img.addEventListener('error', () => img.classList.add('img-loaded'));
      }
    });
  }

  initImageFade();

  // Re-run for dynamically added images
  const imgMo = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        if (node.tagName === 'IMG') {
          initImageFade(node.parentElement);
        } else {
          initImageFade(node);
        }
      });
    });
  });
  imgMo.observe(document.body, { childList: true, subtree: true });

  /* ========================= */
  /* 5. Add-to-Cart Feedback   */
  /* ========================= */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart-btn');
    if (!btn || btn.dataset.feedbackActive) return;

    const original = btn.textContent;
    btn.dataset.feedbackActive = '1';
    btn.textContent = '✓ Added';
    btn.classList.add('is-added');

    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('is-added');
      delete btn.dataset.feedbackActive;
    }, 1400);
  });

  /* ========================= */
  /* 6. Gallery Crossfade      */
  /* ========================= */
  document.addEventListener('click', (e) => {
    const thumb = e.target.closest('.thumbnail[data-img]');
    if (!thumb) return;

    const mainImg = document.getElementById('main-product-image');
    if (!mainImg) return;

    const newSrc = thumb.dataset.img;
    if (mainImg.src.includes(newSrc) || mainImg.src === newSrc) return;

    // Update active state
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');

    // Crossfade
    mainImg.classList.add('is-fading');
    setTimeout(() => {
      mainImg.src = newSrc;
      mainImg.classList.remove('is-fading');
    }, 200);
  });

  /* ========================= */
  /* 7. Page Fade Transition   */
  /* ========================= */
  const overlay = document.createElement('div');
  overlay.id = 'page-transition-overlay';
  overlay.style.cssText = [
    'position:fixed', 'inset:0',
    'background:var(--color-bg-ivory, #F8F5EB)',
    'opacity:0', 'pointer-events:none',
    'z-index:9999',
    'transition:opacity 180ms ease'
  ].join(';');
  document.body.appendChild(overlay);

  // Fade in page on arrival
  requestAnimationFrame(() => {
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
  });

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href) return;
    // Skip external, hash, protocol links, and target="_blank"
    if (
      href.startsWith('#') ||
      href.startsWith('http') ||
      href.startsWith('mailto') ||
      href.startsWith('tel') ||
      href.startsWith('whatsapp') ||
      link.target === '_blank'
    ) return;

    e.preventDefault();
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';
    setTimeout(() => { window.location.href = href; }, 200);
  });

  // On arrival, ensure overlay is invisible
  window.addEventListener('pageshow', () => {
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
  });

})();
