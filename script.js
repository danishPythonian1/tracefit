/* =====================================================
   TraceFit — Navbar & Hero Interactions
===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Initialize Lucide icons ----
  if (window.lucide) {
    lucide.createIcons();
  }

  // ---- Sticky navbar shadow/background on scroll ----
  const navbar = document.getElementById('navbar');

  const handleScroll = () => {
    if (window.scrollY > 8) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  };

  handleScroll(); // set initial state
  window.addEventListener('scroll', handleScroll, { passive: true });

  // ---- Mobile menu toggle ----
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');

  const closeMobileMenu = () => {
    navToggle.classList.remove('is-open');
    navMobile.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  const toggleMobileMenu = () => {
    const isOpen = navMobile.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  };

  navToggle.addEventListener('click', toggleMobileMenu);

  // Close mobile menu when a nav link is tapped
  navMobile.querySelectorAll('.navbar__link, .btn').forEach((el) => {
    el.addEventListener('click', closeMobileMenu);
  });

  // Close mobile menu if the viewport is resized back to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) {
      closeMobileMenu();
    }
  });

  // ---- Trusted Statistics: count-up animation on scroll into view ----
  const statsSection = document.getElementById('stats');
  const countEls = document.querySelectorAll('.js-count');
  const COUNT_DURATION = 1400; // ms

  const easeOutQuad = (t) => t * (2 - t);

  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
    const suffix = el.getAttribute('data-count-suffix') || '';
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / COUNT_DURATION, 1);
      const eased = easeOutQuad(progress);
      const value = Math.round(eased * target);
      el.textContent = `${value}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = `${target}${suffix}`;
      }
    };

    requestAnimationFrame(step);
  };

  if (statsSection && countEls.length) {
    let hasAnimated = false;

    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            hasAnimated = true;
            countEls.forEach(animateCount);
            statsObserver.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );

    statsObserver.observe(statsSection);
  }

  // ---- Generic scroll-reveal for sections below the fold ----
  // (Problem Section and any future section using the .reveal class)
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  }

});