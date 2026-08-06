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

  if (navbar) {
    const handleScroll = () => {
      if (window.scrollY > 8) {
        navbar.classList.add('is-scrolled');
      } else {
        navbar.classList.remove('is-scrolled');
      }
    };

    handleScroll(); // set initial state
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // ---- Mobile menu toggle ----
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');

  if (navToggle && navMobile) {
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
  }

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

  // ---- FAQ accordion ----
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-item__question');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close any other open item so only one answer shows at a time
      faqItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove('is-open');
          other.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('is-open', !isOpen);
      question.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // ---- Dashboard: format today's date in the welcome summary ----
  const dashDate = document.getElementById('dashDate');

  if (dashDate) {
    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    dashDate.textContent = formatted;
  }

  // ---- Dashboard: mobile sidebar drawer ----
  // Only runs on dashboard.html — guarded because the landing page
  // has no #sidebar element.
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarClose = document.getElementById('sidebarClose');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (sidebar && sidebarToggle && sidebarOverlay) {
    const openSidebar = () => {
      sidebar.classList.add('is-open');
      sidebarOverlay.classList.add('is-visible');
      sidebarToggle.setAttribute('aria-expanded', 'true');
    };

    const closeSidebar = () => {
      sidebar.classList.remove('is-open');
      sidebarOverlay.classList.remove('is-visible');
      sidebarToggle.setAttribute('aria-expanded', 'false');
    };

    sidebarToggle.addEventListener('click', openSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);

    if (sidebarClose) {
      sidebarClose.addEventListener('click', closeSidebar);
    }

    // Close the drawer when a nav link is tapped
    sidebar.querySelectorAll('.sidebar__link').forEach((link) => {
      link.addEventListener('click', closeSidebar);
    });

    // Close the drawer if the viewport is resized back to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 960) {
        closeSidebar();
      }
    });
  }

});