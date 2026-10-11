(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme toggle
  const toggle = document.querySelector('.theme-toggle');
  const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
  toggle?.addEventListener('click', () => {
    const current = root.dataset.theme || (systemDark() ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // Nav border on scroll
  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Terminal typing
  const cmd = document.querySelector('.t-cmd');
  const out = document.querySelector('.t-out');
  if (cmd && out) {
    const text = cmd.dataset.type;
    if (reduceMotion) {
      cmd.textContent = text;
      out.hidden = false;
    } else {
      let i = 0;
      cmd.classList.add('typing');
      const tick = () => {
        cmd.textContent = text.slice(0, ++i);
        if (i < text.length) setTimeout(tick, 32 + Math.random() * 40);
        else setTimeout(() => { cmd.classList.remove('typing'); out.hidden = false; }, 280);
      };
      setTimeout(tick, 500);
    }
  }

  // Count-up stats
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    if (reduceMotion || target === 0) { el.textContent = target.toFixed(decimals); return; }
    const start = performance.now();
    const duration = 1200;
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Reveal on scroll + counters
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        if (entry.target.dataset.count !== undefined) animateCount(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal, [data-count]').forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  // Active nav link
  const links = [...document.querySelectorAll('.nav__links a')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const navIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => navIo.observe(s));
  }

  // Copy email
  document.querySelectorAll('.copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const original = btn.textContent;
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = 'Copied ✓';
      } catch (e) {
        btn.textContent = btn.dataset.copy;
      }
      btn.classList.add('is-copied');
      setTimeout(() => { btn.textContent = original; btn.classList.remove('is-copied'); }, 1800);
    });
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
