/* =====================================================
   Simply A2 — Main JS
   ===================================================== */

(function () {
  'use strict';

  // ── Navigation scroll effect ──────────────────────
  const nav = document.querySelector('.nav');
  const scrollTopBtn = document.querySelector('.scroll-top');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav?.classList.toggle('scrolled', y > 60);
    scrollTopBtn?.classList.toggle('visible', y > 400);

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

  // ── Portfolio filter ──────────────────────────────
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      portfolioCards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.opacity = show ? '1' : '0';
        card.style.transform = show ? '' : 'scale(0.95)';
        card.style.pointerEvents = show ? '' : 'none';
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        setTimeout(() => { card.style.display = show ? '' : 'none'; }, show ? 0 : 300);
        if (show) setTimeout(() => { card.style.opacity = '1'; card.style.transform = ''; }, 10);
      });
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

  document.querySelectorAll('.portfolio-open-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(btn.closest('.portfolio-card'));
    });
  });

  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  modalCta?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal?.classList.contains('open')) closeModal(); });

  // ── Load more portfolio cards ─────────────────────
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  loadMoreBtn?.addEventListener('click', () => {
    document.querySelectorAll('.portfolio-card--hidden').forEach(card => {
      card.classList.remove('portfolio-card--hidden');
      card.style.opacity = '0';
      card.style.transform = 'translateY(24px)';
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      setTimeout(() => { card.style.opacity = '1'; card.style.transform = ''; }, 20);
    });
    loadMoreBtn.closest('.portfolio__more').style.display = 'none';
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

  document.querySelectorAll('.service-card, .portfolio-card, .about__value, .contact__detail')
    .forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });

  document.addEventListener('animationend', () => {}, { once: true });

  // Inject .in-view style
  const style = document.createElement('style');
  style.textContent = '.in-view { opacity: 1 !important; transform: none !important; }';
  document.head.appendChild(style);

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
