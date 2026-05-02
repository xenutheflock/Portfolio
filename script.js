const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('#site-nav');
const navLinks = document.querySelectorAll('#site-nav a');
const yearEl = document.querySelector('#year');
const revealEls = document.querySelectorAll('.reveal');
const sections = document.querySelectorAll('main section[id]');
const progressBar = document.querySelector('.scroll-progress');
const backToTopBtn = document.querySelector('.back-to-top');
const themeToggle = document.querySelector('.theme-toggle');
const parallaxEl = document.querySelector('[data-parallax]');
const modal = document.querySelector('#project-modal');
const modalContent = document.querySelector('#modal-content');
const modalClose = document.querySelector('.modal-close');
const caseButtons = document.querySelectorAll('[data-open-modal]');
const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');

const apiMeta = document.querySelector('meta[name="api-base"]');
const API_BASE = (apiMeta?.getAttribute('content') || '').trim();

const THEME_KEY = 'portfolio-theme';

function applyTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
}

const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme === 'dark' || savedTheme === 'light') {
  applyTheme(savedTheme);
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark');
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });
}

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    siteNav.classList.toggle('open');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('visible'));
}

const caseStudyData = {
  clarity: {
    title: 'Clarity Finance Dashboard',
    subtitle: 'UI/UX + Frontend • 2026',
    body: 'Designed and developed a clean financial dashboard focused on readability, scalable components, and responsive analytics widgets.',
  },
  studio: {
    title: 'Studio Portfolio Template',
    subtitle: 'Frontend Developer • 2025',
    body: 'Built a reusable portfolio system with modular sections, accessibility-first semantics, and polished micro-interactions.',
  },
  finder: {
    title: 'Local Finder App Concept',
    subtitle: 'Product Designer • 2025',
    body: 'Created an end-to-end UX concept for local service discovery, from flow design and wireframes to high-fidelity interactive prototypes.',
  },
};

if (modal && modalContent && caseButtons.length) {
  caseButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-open-modal');
      const data = caseStudyData[key];
      if (!data) return;

      modalContent.innerHTML = `
        <h3>${data.title}</h3>
        <p><strong>${data.subtitle}</strong></p>
        <p>${data.body}</p>
      `;
      modal.showModal();
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => modal.close());
  }

  modal.addEventListener('click', (event) => {
    const rect = modal.getBoundingClientRect();
    const inDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (!inDialog) modal.close();
  });
}

if ('IntersectionObserver' in window && sections.length) {
  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          const active = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('active', active);
        });
      });
    },
    { threshold: 0.5 }
  );

  sections.forEach((section) => activeObserver.observe(section));
}

function updateScrollUI() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  if (progressBar) {
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }

  if (backToTopBtn) {
    backToTopBtn.classList.toggle('show', scrollTop > 500);
  }

  if (parallaxEl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const y = Math.min(14, scrollTop * 0.03);
    parallaxEl.style.transform = `translateY(${y}px)`;
  }
}

window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();

if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const payload = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      message: String(formData.get('message') || '').trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      if (formStatus) {
        formStatus.textContent = 'Please complete all required fields.';
        formStatus.dataset.state = 'error';
      }
      return;
    }

    if (formStatus) {
      formStatus.textContent = 'Sending message...';
      formStatus.dataset.state = 'loading';
    }

    try {
      const response = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message.');
      }

      contactForm.reset();
      if (formStatus) {
        formStatus.textContent = 'Message sent successfully. Thank you!';
        formStatus.dataset.state = 'success';
      }
    } catch (error) {
      if (formStatus) {
        formStatus.textContent = error.message || 'Failed to send message.';
        formStatus.dataset.state = 'error';
      }
    }
  });
}
