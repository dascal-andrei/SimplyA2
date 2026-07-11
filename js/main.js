/* =====================================================
   Simply A2 — Main JS
   ===================================================== */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Navigation scroll effect ──────────────────────
  const nav = document.querySelector('.nav');
  const scrollTopBtn = document.querySelector('.scroll-top');

  const portfolioSection = document.getElementById('portofoliu');
  const navLogo = document.querySelector('.nav__logo-img');
  let navLogoCream = false;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav?.classList.toggle('scrolled', y > 60);
    scrollTopBtn?.classList.toggle('visible', y > 400);

    // Cream nav when inside portfolio section
    if (nav && portfolioSection) {
      const pTop       = portfolioSection.offsetTop - 80;
      const pBottom    = pTop + portfolioSection.offsetHeight;
      const inPortfolio = y >= pTop && y < pBottom;
      nav.classList.toggle('nav--cream', inPortfolio);
      if (navLogo && inPortfolio !== navLogoCream) {
        navLogoCream = inPortfolio;
        navLogo.src = inPortfolio ? 'assets/logo-badge.svg' : 'assets/logo-badge-dark.svg';
      }
    }

    // Active nav link highlight
    document.querySelectorAll('section[id]').forEach(section => {
      const top = section.offsetTop - 100;
      const bottom = top + section.offsetHeight;
      const link = document.querySelector(`.nav__links a[href="#${section.id}"]`);
      if (link) link.classList.toggle('active', y >= top && y < bottom);
    });
  }, { passive: true });

  // ── Mobile menu ───────────────────────────────────
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile-menu');

  hamburger?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('open');
    const bars = hamburger.querySelectorAll('span');
    if (mobileMenu?.classList.contains('open')) {
      bars[0].style.transform = 'translateY(7px) rotate(45deg)';
      bars[1].style.opacity = '0';
      bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      bars.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
    }
  });

  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger?.querySelectorAll('span').forEach(b => {
        b.style.transform = '';
        b.style.opacity = '';
      });
    });
  });

  // ── Portfolio filter + load more ──────────────────
  const filterBtns    = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');
  const loadMoreBtn   = document.getElementById('loadMoreBtn');
  const moreContainer = loadMoreBtn?.closest('.portfolio__more');
  const PAGE = 3;
  let activeFilter = 'all';
  let expanded = false;

  const BTN_MORE = 'Vezi mai multe <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const BTN_LESS = 'Arată mai puțin <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 13V3M3 8l5-5 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function showCard(card) {
    card.classList.remove('portfolio-card--hidden');
    card.style.display = '';
    if (reduceMotion) {
      card.style.opacity = '1';
      card.style.transform = '';
      return;
    }
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      card.style.opacity = '1';
      card.style.transform = '';
    }));
  }

  function hideCard(card) {
    if (getComputedStyle(card).display === 'none') return;
    if (reduceMotion) {
      card.style.display = 'none';
      return;
    }
    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    const onEnd = () => {
      card.style.display = 'none';
      card.removeEventListener('transitionend', onEnd);
    };
    card.addEventListener('transitionend', onEnd);
    setTimeout(() => { if (card.style.opacity === '0') card.style.display = 'none'; }, 350);
  }

  function applyFilter(filter) {
    activeFilter = filter;
    expanded = false;
    if (loadMoreBtn) loadMoreBtn.innerHTML = BTN_MORE;

    const all = Array.from(portfolioCards);
    const matching    = all.filter(c => filter === 'all' || c.dataset.category === filter);
    const nonMatching = all.filter(c => filter !== 'all' && c.dataset.category !== filter);

    nonMatching.forEach(c => { hideCard(c); });

    matching.forEach((c, i) => {
      if (i < PAGE) { showCard(c); }
      else          { hideCard(c); }
    });

    if (moreContainer) {
      moreContainer.style.display = matching.length > PAGE ? 'flex' : 'none';
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });

  // ── Contact form ──────────────────────────────────
  const form = document.querySelector('.contact__form form');
  const successMsg = document.querySelector('.form-success');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Se trimite...';

    const data = new FormData(form);
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data
      });
      const json = await res.json();
      if (json.success) {
        form.style.display = 'none';
        if (successMsg) successMsg.classList.add('visible');
      } else {
        btn.disabled = false;
        btn.textContent = 'Trimite mesajul';
        alert('Eroare la trimitere. Încearcă din nou sau scrie direct la contact@simplya2.ro');
      }
    } catch {
      btn.disabled = false;
      btn.textContent = 'Trimite mesajul';
      alert('Eroare de rețea. Scrie-ne direct la contact@simplya2.ro');
    }
  });

  // ── Portfolio modal ───────────────────────────────
  const modal        = document.getElementById('portfolioModal');
  const modalClose   = document.getElementById('pmodalClose');
  const modalTag     = document.getElementById('pmodal-tag');
  const modalTitle   = document.getElementById('pmodal-title');
  const modalDesc    = document.getElementById('pmodal-desc');
  const modalDetails = document.getElementById('pmodal-details');
  const modalCta     = document.querySelector('.pmodal-cta');

  function openModal(card) {
    modalTag.textContent   = card.dataset.tag   || '';
    modalTitle.textContent = card.dataset.title || '';
    modalDesc.textContent  = card.dataset.desc  || '';

    modalDetails.innerHTML = '';
    ['1','2','3','4'].forEach(n => {
      const val = card.dataset[`detail${n}`];
      if (val) {
        const li = document.createElement('li');
        li.textContent = val;
        modalDetails.appendChild(li);
      }
    });

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Modal triggers disabled — re-enable by uncommenting
  // document.querySelectorAll('.portfolio-open-btn').forEach(btn => {
  //   btn.addEventListener('click', (e) => {
  //     e.preventDefault();
  //     openModal(btn.closest('.portfolio-card'));
  //   });
  // });
  // modalClose?.addEventListener('click', closeModal);
  // modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  // modalCta?.addEventListener('click', closeModal);
  // document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal?.classList.contains('open')) closeModal(); });

  loadMoreBtn?.addEventListener('click', () => {
    if (!expanded) {
      const all = Array.from(portfolioCards);
      const matching = all.filter(c => activeFilter === 'all' || c.dataset.category === activeFilter);
      matching.forEach(c => {
        if (c.style.display === 'none' || c.classList.contains('portfolio-card--hidden')) showCard(c);
      });
      expanded = true;
      loadMoreBtn.innerHTML = BTN_LESS;
    } else {
      applyFilter(activeFilter);
    }
  });

  // ── Scroll-to-top ─────────────────────────────────
  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Intersection Observer — fade-in animations ────
  const observerOpts = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, observerOpts);

  const revealSelectors = [
    '.hero__top', '.hero__desc', '.hero__actions',
    '.section-header',
    '.service-card', '.portfolio-card', '.about__value', '.contact__detail',
    '.about__visual', '.contact__form', '.footer__inner'
  ];
  const gridStaggerSelectors = '.services__grid .service-card, .portfolio__grid .portfolio-card, .about__values .about__value';

  document.querySelectorAll(revealSelectors.join(', ')).forEach(el => {
    el.classList.add('reveal');
    if (el.matches(gridStaggerSelectors)) {
      const idx = Array.from(el.parentElement.children).indexOf(el);
      el.style.setProperty('--reveal-delay', `${Math.min(idx, 5) * 0.08}s`);
    }
    if (reduceMotion) {
      el.classList.add('in-view');
    } else {
      observer.observe(el);
    }
  });

  // ── Typed counter animation ────────────────────────
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1600;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current) + (el.dataset.suffix || '');
      if (current >= target) clearInterval(timer);
    }, 16);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

})();
