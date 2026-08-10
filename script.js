/* =====================================================
   TraceFit — Navbar & Hero Interactions
===================================================== */

// Small reusable debounce so scroll/resize handlers don't run on every
// single event — shared by the mobile nav and sidebar resize listeners.
const debounce = (fn, delay = 150) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

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
    window.addEventListener(
      'resize',
      debounce(() => {
        if (window.innerWidth > 860) {
          closeMobileMenu();
        }
      })
    );
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
  // Replays every time: the class is added on enter and removed on exit,
  // so scrolling back up to a section plays the entrance animation again.
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-visible', entry.isIntersecting);
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

  // ---- Dashboard: section navigator ("What to see?" dropdown) ----
  // Replaces the old top-bar search. Opens a small menu of dashboard
  // sections; picking one smoothly scrolls there and briefly highlights it.
  const sectionNav = document.getElementById('sectionNav');
  const sectionNavTrigger = document.getElementById('sectionNavTrigger');
  const sectionNavMenu = document.getElementById('sectionNavMenu');

  if (sectionNav && sectionNavTrigger && sectionNavMenu) {
    const openSectionNav = () => {
      sectionNavMenu.hidden = false;
      sectionNavTrigger.setAttribute('aria-expanded', 'true');
      // Add the animating class on the next frame so the browser
      // registers the "hidden" -> visible state first, letting the
      // opacity/transform transition actually play instead of
      // snapping straight to its open state.
      requestAnimationFrame(() => sectionNav.classList.add('is-open'));
    };

    const closeSectionNav = () => {
      sectionNav.classList.remove('is-open');
      sectionNavTrigger.setAttribute('aria-expanded', 'false');
      // Wait for the closing transition before hiding, so it fades
      // out instead of disappearing instantly.
      window.setTimeout(() => {
        if (!sectionNav.classList.contains('is-open')) {
          sectionNavMenu.hidden = true;
        }
      }, 180);
    };

    sectionNavTrigger.addEventListener('click', () => {
      const isOpen = sectionNav.classList.contains('is-open');
      if (isOpen) {
        closeSectionNav();
      } else {
        openSectionNav();
      }
    });

    // Close when clicking anywhere outside the control
    document.addEventListener('click', (e) => {
      if (sectionNav.classList.contains('is-open') && !sectionNav.contains(e.target)) {
        closeSectionNav();
      }
    });

    // Close with Escape, and return focus to the trigger
    sectionNav.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSectionNav();
        sectionNavTrigger.focus();
      }
    });

    // Selecting a section: close the menu, scroll smoothly to it, and
    // apply a brief highlight so the destination is unmistakable.
    sectionNavMenu.querySelectorAll('.section-nav__item').forEach((item) => {
      item.addEventListener('click', () => {
        const target = document.getElementById(item.dataset.target);
        closeSectionNav();

        if (!target) return;

        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        target.classList.remove('dash-jump-highlight');
        // Force reflow so the highlight animation replays even if the
        // same section is selected twice in a row.
        void target.offsetWidth;
        target.classList.add('dash-jump-highlight');
        target.addEventListener(
          'animationend',
          () => target.classList.remove('dash-jump-highlight'),
          { once: true }
        );
      });
    });
  }

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

  // ---- Dashboard: Weekly Activity Charts (Chart.js) ----
  // Only runs on dashboard.html when Chart.js has loaded and the
  // steps chart canvas is present.
  if (typeof Chart !== 'undefined' && document.getElementById('stepsChart')) {

    // Read design-system colors straight from the CSS custom
    // properties so the charts always match the current palette.
    const rootStyles = getComputedStyle(document.documentElement);
    const getColor = (name) => rootStyles.getPropertyValue(name).trim();

    const colors = {
      primary: getColor('--color-primary'),
      secondary: getColor('--color-secondary'),
      border: getColor('--color-border'),
      textMuted: getColor('--color-text-muted'),
    };

    const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Shared Chart.js defaults so every chart looks consistent
    // without repeating the same options object four times.
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = colors.textMuted;

    const baseScales = {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: { size: 11.5 } },
      },
      y: {
        grid: { color: colors.border },
        border: { display: false },
        ticks: { font: { size: 11.5 }, maxTicksLimit: 5 },
      },
    };

    const baseTooltip = {
      backgroundColor: '#0F172A',
      titleFont: { family: "'Plus Jakarta Sans', sans-serif", weight: '700', size: 12.5 },
      bodyFont: { family: "'Inter', sans-serif", size: 12 },
      padding: 10,
      cornerRadius: 10,
      displayColors: false,
    };

    // Small helper so each chart only has to pass its own canvas id,
    // chart type, data, and a couple of visual tweaks.
    const renderChart = (canvasId, type, values, { color, fill = false, suffix = '' } = {}) => {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;

      new Chart(canvas.getContext('2d'), {
        type,
        data: {
          labels: WEEK_LABELS,
          datasets: [
            {
              data: values,
              borderColor: color,
              backgroundColor: fill ? `${color}26` : color, // '26' = ~15% alpha hex
              borderRadius: type === 'bar' ? 6 : 0,
              borderWidth: type === 'line' ? 2.5 : 0,
              fill,
              tension: 0.4,
              pointRadius: type === 'line' ? 3 : 0,
              pointBackgroundColor: color,
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              maxBarThickness: 34,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }, // custom legend chip is rendered in HTML
            tooltip: {
              ...baseTooltip,
              callbacks: {
                label: (ctx) => `${ctx.formattedValue}${suffix}`,
              },
            },
          },
          scales: baseScales,
        },
      });
    };

    // Dummy 7-day data — the final (today) value matches the figure
    // shown on its corresponding Health Overview card for consistency.
    renderChart('stepsChart', 'line', [6200, 7400, 6800, 9100, 7600, 10200, 8542], {
      color: colors.primary,
    });

    renderChart('sleepChart', 'bar', [6.8, 7.2, 6.5, 7.8, 7.0, 8.1, 7.7], {
      color: colors.secondary,
      suffix: 'h',
    });
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
      // Move focus into the drawer so keyboard users land somewhere useful
      (sidebarClose || sidebar.querySelector('.sidebar__link'))?.focus();
    };

    const closeSidebar = () => {
      const wasOpen = sidebar.classList.contains('is-open');
      sidebar.classList.remove('is-open');
      sidebarOverlay.classList.remove('is-visible');
      sidebarToggle.setAttribute('aria-expanded', 'false');
      // Return focus to the toggle button so keyboard focus isn't lost
      if (wasOpen) {
        sidebarToggle.focus();
      }
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

    // Close the drawer with the Escape key (keyboard accessibility)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('is-open')) {
        closeSidebar();
      }
    });

    // Close the drawer if the viewport is resized back to desktop
    window.addEventListener(
      'resize',
      debounce(() => {
        if (window.innerWidth > 960) {
          closeSidebar();
        }
      })
    );
  }

  // ---- Auth pages: password show/hide (Login, Register, Reset Password) ----
  document.querySelectorAll('.password-toggle').forEach((toggle) => {
    const input = document.getElementById(toggle.dataset.target);
    if (!input) return;

    toggle.addEventListener('click', () => {
      const isVisible = toggle.classList.toggle('is-visible');
      input.type = isVisible ? 'text' : 'password';
      toggle.setAttribute('aria-label', isVisible ? 'Hide password' : 'Show password');
    });
  });

  // Shared basic email-format check, used by Login and Forgot Password.
  const isValidAuthEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  // ---- Login page: stop the native page reload on submit and surface
  //      the (already-designed) email-format error inline instead ----
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    const loginEmail = document.getElementById('loginEmail');
    const loginEmailGroup = document.getElementById('loginEmailGroup');

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      loginEmailGroup.classList.toggle('has-error', !isValidAuthEmail(loginEmail.value));
      // Hook up to real authentication once the backend is ready.
    });

    loginEmail.addEventListener('input', () => loginEmailGroup.classList.remove('has-error'));
  }

  // ---- Forgot Password page: same submit-reload fix + email check ----
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');

  if (forgotPasswordForm) {
    const forgotEmail = document.getElementById('forgotEmail');
    const forgotEmailGroup = document.getElementById('forgotEmailGroup');

    forgotPasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      forgotEmailGroup.classList.toggle('has-error', !isValidAuthEmail(forgotEmail.value));
      // Hook up to real password-reset delivery once the backend is ready.
    });

    forgotEmail.addEventListener('input', () => forgotEmailGroup.classList.remove('has-error'));
  }

  // ---- Register page: confirm-password check + submit-reload fix ----
  const registerForm = document.getElementById('registerForm');
  const registerPassword = document.getElementById('registerPassword');
  const registerConfirm = document.getElementById('registerConfirm');
  const registerConfirmGroup = document.getElementById('registerConfirmGroup');

  if (registerPassword && registerConfirm && registerConfirmGroup) {
    const checkPasswordsMatch = () => {
      const hasValue = registerConfirm.value.length > 0;
      const matches = registerConfirm.value === registerPassword.value;
      registerConfirmGroup.classList.toggle('has-error', hasValue && !matches);
    };

    registerConfirm.addEventListener('input', checkPasswordsMatch);
    registerPassword.addEventListener('input', checkPasswordsMatch);
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (registerConfirmGroup && registerConfirm && registerPassword) {
        const matches = registerConfirm.value === registerPassword.value;
        registerConfirmGroup.classList.toggle('has-error', !matches);
      }
      // Hook up to real account creation once the backend is ready.
    });
  }

  // ---- Reset Password page: strength meter + live requirements checklist ----
  const resetPasswordForm = document.getElementById('resetPasswordForm');
  const resetPassword = document.getElementById('resetPassword');
  const resetConfirm = document.getElementById('resetConfirm');
  const resetConfirmGroup = document.getElementById('resetConfirmGroup');
  const resetStrength = document.getElementById('passwordStrength');

  if (resetPassword) {
    const strengthLabel = resetStrength ? resetStrength.querySelector('.password-strength__label') : null;

    const requirements = [
      { id: 'reqLength', test: (v) => v.length >= 8 },
      { id: 'reqUppercase', test: (v) => /[A-Z]/.test(v) },
      { id: 'reqLowercase', test: (v) => /[a-z]/.test(v) },
      { id: 'reqNumber', test: (v) => /\d/.test(v) },
    ];

    const getStrength = (value) => {
      if (!value) return null;

      const metCount = requirements.filter((req) => req.test(value)).length;
      const hasLength12 = value.length >= 12;

      if (metCount <= 1) return 'weak';
      if (metCount === 2 || (metCount === 3 && !hasLength12)) return 'medium';
      if (metCount >= 3) return 'strong';
      return 'weak';
    };

    const strengthText = { weak: 'Weak', medium: 'Medium', strong: 'Strong' };

    const updateRequirements = (value) => {
      requirements.forEach((req) => {
        const item = document.getElementById(req.id);
        if (item) item.classList.toggle('is-met', req.test(value));
      });
    };

    const updateStrength = (value) => {
      if (!resetStrength) return;
      const level = getStrength(value);

      if (!level) {
        resetStrength.classList.remove('is-visible');
        return;
      }

      resetStrength.classList.add('is-visible');
      resetStrength.setAttribute('data-level', level);
      if (strengthLabel) strengthLabel.textContent = strengthText[level];
    };

    resetPassword.addEventListener('input', () => {
      updateRequirements(resetPassword.value);
      updateStrength(resetPassword.value);
    });
  }

  // ---- Reset Password page: frontend-only confirm-password check ----
  if (resetPassword && resetConfirm && resetConfirmGroup) {
    const checkResetPasswordsMatch = () => {
      const hasValue = resetConfirm.value.length > 0;
      const matches = resetConfirm.value === resetPassword.value;
      resetConfirmGroup.classList.toggle('has-error', hasValue && !matches);
    };

    resetConfirm.addEventListener('input', checkResetPasswordsMatch);
    resetPassword.addEventListener('input', checkResetPasswordsMatch);
  }

  // ---- Reset Password page: submit-reload fix ----
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (resetConfirmGroup && resetConfirm && resetPassword) {
        const matches = resetConfirm.value === resetPassword.value;
        resetConfirmGroup.classList.toggle('has-error', !matches);
      }
      // Hook up to real password reset once the backend is ready.
    });
  }

});