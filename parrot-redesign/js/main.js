/* ============================================================
   PARROT GROUP — Shared JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Init Lucide icons ----
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // ---- Header scroll shadow ----
  const header = document.querySelector('.main-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

// ---- Slide-up menu card ----
const menuBtn    = document.getElementById('menuBtn');
const navOverlay = document.getElementById('navOverlay');

if (menuBtn && navOverlay) {
  const bgImgs = navOverlay.querySelectorAll('.bg-img');
  const bgDef  = document.getElementById('bgDefault');
  const cLinks = navOverlay.querySelectorAll('.c-link');

  function openMenu() {
    menuBtn.classList.add('is-open');
    navOverlay.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    menuBtn.classList.remove('is-open');
    navOverlay.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    bgImgs.forEach(i => i.classList.remove('active'));
    if (bgDef) bgDef.classList.remove('hidden');
  }

  menuBtn.addEventListener('click', () => {
    navOverlay.classList.contains('is-open') ? closeMenu() : openMenu();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  cLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      bgImgs.forEach(i => i.classList.toggle('active', i.dataset.key === link.dataset.key));
      if (bgDef) bgDef.classList.add('hidden');
    });
    link.addEventListener('mouseleave', () => {
      bgImgs.forEach(i => i.classList.remove('active'));
      if (bgDef) bgDef.classList.remove('hidden');
    });
  });
}

  // ---- Scroll fade-in observer ----
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.10 });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // ---- Typing animation (homepage hero) ----
  const typingEl = document.getElementById('typing-text');
  if (typingEl) {
    const words = ['Unforgettable', 'Experiences', 'Moments', 'Connections', 'Events'];
    let wi = 0, ci = 0, deleting = false;
    function typeLoop() {
      const word = words[wi];
      if (!deleting) {
        typingEl.textContent = word.slice(0, ++ci);
        if (ci === word.length) { deleting = true; return setTimeout(typeLoop, 2200); }
      } else {
        typingEl.textContent = word.slice(0, --ci);
        if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
      }
      setTimeout(typeLoop, deleting ? 52 : 88);
    }
    typeLoop();
  }

  // ---- Equipment page: filter tabs ----
  const tabBtns = document.querySelectorAll('[data-filter]');
  if (tabBtns.length) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        document.querySelectorAll('.eq-card').forEach(card => {
          card.classList.toggle('hidden', f !== 'all' && card.dataset.cat !== f);
        });
      });
    });
  }

  // ---- Portfolio page: filter tabs ----
  const pfTabBtns = document.querySelectorAll('[data-portfolio-filter]');
  if (pfTabBtns.length) {
    pfTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        pfTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.portfolioFilter;
        document.querySelectorAll('.pf-card[data-cat]').forEach(card => {
          card.classList.toggle('hidden', f !== 'all' && card.dataset.cat !== f);
        });
      });
    });
  }

  // ---- Portfolio modal ----
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose   = document.getElementById('modal-close');

  window.openPortfolioModal = function(el) {
    if (!modalOverlay) return;
    document.getElementById('modal-tag').textContent   = el.dataset.cat || '';
    document.getElementById('modal-title').textContent = el.dataset.title || '';
    document.getElementById('modal-desc').textContent  = el.dataset.desc || '';
    document.getElementById('modal-info').textContent  = el.dataset.info || '';
    document.getElementById('modal-loc').textContent   = el.dataset.loc || '';
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  if (modalOverlay) {
    modalOverlay.addEventListener('click', e => {
      if (e.target === modalOverlay) closeModal();
    });
  }
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }
  function closeModal() {
    if (modalOverlay) modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ---- Estimator page ----
  const guestsSlider   = document.getElementById('guests-slider');
  const durationSlider = document.getElementById('duration-slider');
  const eventType      = document.getElementById('event-type');
  const stageSize      = document.getElementById('stage-size');
  const grandTotal     = document.getElementById('grand-total');
  const invoiceLines   = document.getElementById('invoice-lines');

  function calcEstimate() {
    if (!grandTotal) return;
    const guests   = +(guestsSlider?.value || 150);
    const days     = +(durationSlider?.value || 1);
    const mult     = +(eventType?.value || 1.0);
    const stageCost= +(stageSize?.value || 2500) * 100;

    // Base: KSh 8,000 per guest + scaling
    let base = guests * 80;
    let total = base;
    for (let d = 1; d < days; d++) total += base * 0.45;
    total *= mult;
    total += stageCost;

    const lines = [];
    lines.push({ l: `Base (${guests} guests × ${days} day${days > 1 ? 's' : ''})`, v: Math.round(total) });

    document.querySelectorAll('.addon-card.checked').forEach(card => {
      const p = +(card.dataset.price || 0) * 100;
      total += p;
      lines.push({ l: card.querySelector('.addon-title')?.textContent || '', v: p });
    });

    if (invoiceLines) {
      invoiceLines.innerHTML = lines
        .map(l => `<div class="inv-line"><span>${l.l}</span><span>KSh ${l.v.toLocaleString()}</span></div>`)
        .join('');
    }
    grandTotal.textContent = `KSh ${Math.round(total).toLocaleString()}`;
  }

  if (guestsSlider) {
    guestsSlider.addEventListener('input', function () {
      const v = document.getElementById('guests-val');
      if (v) v.textContent = this.value + ' Guests';
      calcEstimate();
    });
  }
  if (durationSlider) {
    durationSlider.addEventListener('input', function () {
      const v = document.getElementById('duration-val');
      if (v) v.textContent = this.value + ' Day' + (+this.value > 1 ? 's' : '');
      calcEstimate();
    });
  }
  if (eventType)  eventType.addEventListener('change',  calcEstimate);
  if (stageSize)  stageSize.addEventListener('change',  calcEstimate);
  if (grandTotal) calcEstimate();

  // Addon toggle
  window.toggleAddon = function(card) {
    card.classList.toggle('checked');
    calcEstimate();
  };

  // ---- Dashboard page ----
  const progressBar = document.getElementById('progress-bar');
  const progressVal = document.getElementById('progress-val');

  function updateDashProgress() {
    let total = 0;
    document.querySelectorAll('.check-item').forEach(item => {
      if (item.classList.contains('done')) total += +(item.dataset.weight || 0);
    });
    if (progressBar) progressBar.style.width = total + '%';
    if (progressVal) progressVal.textContent  = total + '%';
  }

  document.querySelectorAll('.check-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('done');
      updateDashProgress();
      // Add log entry when checked
      if (item.classList.contains('done')) {
        appendLog(`✓ ${item.querySelector('.check-label')?.textContent} — marked complete.`, true);
      }
    });
  });

  // Animate progress bar on load
  if (progressBar) setTimeout(() => { progressBar.style.width = '75%'; }, 500);

  // Dashboard sidebar nav
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Live log ticker
  const logConsole = document.getElementById('log-console');
  const logMessages = [
    'Backdrop tension check complete — nominal.',
    'LED wall segment B calibrated. Pixel uniformity 99.2%.',
    'FOH cable routing finalized. DMX universe confirmed.',
    'Secondary 80kVA generator on standby — ATS tested.',
    'Comms headsets distributed to all 12 crew members.',
    'PA system frequency sweep complete. Clearance: pass.',
    'Lighting rig pan/tilt cycle test finished — no faults.',
  ];
  let lmIdx = 0;
  if (logConsole) {
    setInterval(() => {
      appendLog(logMessages[lmIdx % logMessages.length], false);
      lmIdx++;
    }, 7000);
  }

  function appendLog(text, accent = false) {
    if (!logConsole) return;
    const t  = new Date();
    const ts = `[${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}]`;
    const el = document.createElement('div');
    el.className = 'log-entry';
    el.innerHTML = `<span class="log-time">${ts}</span><span class="log-text${accent ? ' accent' : ''}">${text}</span>`;
    logConsole.appendChild(el);
    logConsole.scrollTop = logConsole.scrollHeight;
  }
  function pad(n) { return String(n).padStart(2, '0'); }

  // ---- Stage Designer page ----
  const stageContainer = document.getElementById('stage-svg-container');

  function buildStage(preset = 'concert', theme = 'neon', backdrop = 'visuals', fog = false) {
    if (!stageContainer) return;
    const themes = {
      neon:   { main: '#06b6d4', second: '#8b5cf6', bg: '#0d1117' },
      amber:  { main: '#f59e0b', second: '#ef4444', bg: '#1a0f00' },
      forest: { main: '#10b981', second: '#06b6d4', bg: '#001a0f' },
    };
    const c = themes[theme] || themes.neon;

    const presets = {
      concert:   { stageW: 340, stageH: 80, label: 'Concert Arena' },
      corporate: { stageW: 280, stageH: 60, label: 'Corporate Forum' },
      runway:    { stageW: 180, stageH: 100, label: 'Runway Gala' },
    };
    const p = presets[preset] || presets.concert;

    const sw = p.stageW, sh = p.stageH;
    const cx = 400, cy = 280;

    const backdropContent = backdrop === 'brand'
      ? `<text x="${cx}" y="${cy - sh - 30}" text-anchor="middle" font-family="Outfit,sans-serif" font-size="14" font-weight="700" fill="${c.main}" opacity="0.8">PARROT GROUP</text>`
      : backdrop === 'none'
        ? ''
        : `<rect x="${cx - sw / 2}" y="${cy - sh - 60}" width="${sw}" height="50" rx="4" fill="url(#screenGrad)" opacity="0.9"/>`;

    const fogEffect = fog
      ? `<ellipse cx="${cx}" cy="${cy + 10}" rx="${sw * 0.7}" ry="22" fill="rgba(255,255,255,0.06)" filter="url(#blur)"/>`
      : '';

    stageContainer.innerHTML = `
    <svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;">
      <defs>
        <linearGradient id="stageGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${c.main}" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="${c.second}" stop-opacity="0.1"/>
        </linearGradient>
        <linearGradient id="screenGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${c.main}" stop-opacity="0.9"/>
          <stop offset="50%" stop-color="${c.second}" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="${c.main}" stop-opacity="0.9"/>
        </linearGradient>
        <radialGradient id="spotGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${c.main}" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="${c.main}" stop-opacity="0"/>
        </radialGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="8"/></filter>
      </defs>

      <!-- BG -->
      <rect width="800" height="480" fill="${c.bg}"/>
      <!-- Grid -->
      <g opacity="0.05" stroke="${c.main}" stroke-width="0.5">
        ${Array.from({length:13},(_,i)=>`<line x1="${i*66}" y1="0" x2="${i*66}" y2="480"/>`).join('')}
        ${Array.from({length:8}, (_,i)=>`<line x1="0" y1="${i*68}" x2="800" y2="${i*68}"/>`).join('')}
      </g>

      <!-- Audience -->
      ${Array.from({length:7}, (_,row) =>
        Array.from({length:20}, (_,col) => {
          const x = 40 + col * 37;
          const y = 380 + row * 14;
          const opacity = 0.15 + (6 - row) * 0.06;
          return `<ellipse cx="${x}" cy="${y}" rx="5" ry="7" fill="${c.main}" opacity="${opacity.toFixed(2)}"/>`;
        }).join('')
      ).join('')}

      <!-- Truss -->
      <rect x="${cx - sw / 2 - 20}" y="${cy - sh - 70}" width="${sw + 40}" height="10" rx="4" fill="${c.main}" opacity="0.4"/>
      <!-- Truss verticals -->
      <line x1="${cx - sw / 2 - 15}" y1="${cy - sh - 60}" x2="${cx - sw / 2 - 15}" y2="${cy - sh}" stroke="${c.main}" stroke-width="3" opacity="0.3"/>
      <line x1="${cx + sw / 2 + 15}" y1="${cy - sh - 60}" x2="${cx + sw / 2 + 15}" y2="${cy - sh}" stroke="${c.main}" stroke-width="3" opacity="0.3"/>

      <!-- Spot lights (moving heads) -->
      ${[-sw/2+30, -sw/6, sw/6, sw/2-30].map(offset => `
        <line x1="${cx + offset}" y1="${cy - sh - 65}" x2="${cx + offset * 0.4}" y2="${cy - sh + 20}"
              stroke="${c.main}" stroke-width="1.5" opacity="0.25"/>
        <ellipse cx="${cx + offset * 0.4}" cy="${cy - sh + 20}" rx="20" ry="8" fill="${c.main}" opacity="0.12"/>
        <circle cx="${cx + offset}" cy="${cy - sh - 64}" r="5" fill="${c.second}" opacity="0.8"/>
      `).join('')}

      <!-- Screen backdrop -->
      ${backdropContent}

      <!-- Stage platform -->
      <rect x="${cx - sw / 2}" y="${cy - sh}" width="${sw}" height="${sh}" rx="6" fill="url(#stageGrad)" stroke="${c.main}" stroke-width="1.5" stroke-opacity="0.5"/>

      <!-- Stage steps -->
      <rect x="${cx - sw / 4}" y="${cy}" width="${sw / 2}" height="12" rx="3" fill="${c.main}" opacity="0.15"/>
      <rect x="${cx - sw / 3}" y="${cy + 12}" width="${sw * 0.66}" height="10" rx="3" fill="${c.main}" opacity="0.10"/>

      <!-- Speaker stacks -->
      <rect x="${cx - sw / 2 - 30}" y="${cy - sh + 10}" width="18" height="${sh - 10}" rx="4" fill="${c.second}" opacity="0.5"/>
      <rect x="${cx + sw / 2 + 12}" y="${cy - sh + 10}" width="18" height="${sh - 10}" rx="4" fill="${c.second}" opacity="0.5"/>

      <!-- Fog -->
      ${fogEffect}

      <!-- Label -->
      <text x="${cx}" y="460" text-anchor="middle" font-family="Outfit,sans-serif" font-size="11" fill="${c.main}" opacity="0.5" letter-spacing="2">${p.label.toUpperCase()} — PARROT GROUP STAGE DESIGN</text>
    </svg>`;
  }

  if (stageContainer) {
    buildStage();

    document.querySelectorAll('.style-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.style-toggle').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        rebuildStage();
      });
    });
    document.querySelectorAll('.color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        rebuildStage();
      });
    });
    const backdropSel = document.getElementById('backdrop-select');
    if (backdropSel) backdropSel.addEventListener('change', rebuildStage);

    const fogBtn = document.getElementById('trigger-smoke');
    let fogOn = false;
    if (fogBtn) {
      fogBtn.addEventListener('click', () => {
        fogOn = !fogOn;
        fogBtn.textContent = fogOn ? '💨 Fog Active' : 'Trigger Fog Machine';
        rebuildStage(fogOn);
      });
    }

    function rebuildStage(fog = fogOn) {
      const preset   = document.querySelector('.style-toggle.active')?.dataset.stylePreset || 'concert';
      const theme    = document.querySelector('.color-dot.active')?.dataset.colorTheme    || 'neon';
      const backdrop = document.getElementById('backdrop-select')?.value || 'visuals';
      buildStage(preset, theme, backdrop, fog);
    }
  }

  // ---- Contact form submit ----
  const submitBtn = document.getElementById('form-submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const name  = document.getElementById('contact-name')?.value;
      const email = document.getElementById('contact-email')?.value;
      const msg   = document.getElementById('contact-message')?.value;
      if (!name || !email || !msg) {
        alert('Please fill in your name, email, and message before sending.');
        return;
      }
      const s = document.getElementById('success-msg');
      if (s) s.style.display = 'flex';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.5';
    });
  }

});
