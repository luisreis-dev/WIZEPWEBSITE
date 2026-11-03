/* ==========================================================================
   WIZEP | script.js
   Menu mobile, acordeão, animações de entrada, contato e detalhes de interação.
   ========================================================================== */

/* Preencha aqui os canais reais. Os links do site são atualizados sozinhos.
   whatsapp: só números, com DDI e DDD. Ex.: '5511900000000'
   email: endereço completo. Redes: URL completa, com https:// */
const CONTATO = {
  whatsapp: '5537998409492',
  email: '',
  instagram: '',
  linkedin: '',
  behance: '',
};

(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Barra de navegação e menu mobile --- */
  const nav = $('#nav');
  const toggle = $('#navToggle');
  const menu = $('#mobileMenu');

  const setMenu = (open) => {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('is-locked', open);
  };

  toggle.addEventListener('click', () => setMenu(menu.hidden));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) {
      setMenu(false);
      toggle.focus();
    }
  });

  // Se a tela crescer com o menu aberto (ex.: girar o tablet), fecha o menu.
  matchMedia('(min-width: 1025px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
  });

  /* --- Rolagem: borda da navbar e parallax leve dos adesivos --- */
  const parallaxItems = reduceMotion ? [] : $$('[data-parallax]');
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-stuck', y > 8);
    parallaxItems.forEach((el) => {
      el.style.transform = `translateY(${y * Number(el.dataset.parallax)}px)`;
    });
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* --- Link ativo na navegação --- */
  const navLinks = $$('.nav__links a');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => {
        a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  $$('main section[id]').forEach((s) => spy.observe(s));

  /* --- Animações de entrada --- */
  const appear = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.classList.contains('pop')) {
        el.classList.add('is-entering');
        // Libera a transição do adesivo para o hover depois da entrada.
        setTimeout(() => el.classList.remove('is-entering'), 1100);
      }
      el.classList.add('is-in');
      obs.unobserve(el);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

  $$('.reveal, .pop').forEach((el) => appear.observe(el));

  /* --- Acordeão do FAQ: abre uma resposta por vez --- */
  const items = $$('.qa');

  const setItem = (item, open) => {
    item.classList.toggle('is-open', open);
    $('.qa__q', item).setAttribute('aria-expanded', String(open));
  };

  items.forEach((item) => {
    $('.qa__q', item).addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      items.forEach((other) => setItem(other, false));
      setItem(item, willOpen);
    });
  });

  /* --- Portfólio: espaço reservado se uma imagem não carregar --- */
  const markMissing = (img) => {
    const box = img.closest('.project__shot');
    const name = $('.project__name', img.closest('.project')).textContent;
    const path = img.getAttribute('src');
    img.remove();
    const note = document.createElement('div');
    note.className = 'project__missing';
    note.innerHTML = '<span></span><code></code>';
    note.firstChild.textContent = `Imagem pendente: ${name}`;
    note.lastChild.textContent = `Adicione o arquivo em ${path}`;
    box.append(note);
  };

  $$('.project__shot img').forEach((img) => {
    if (img.complete && img.naturalWidth === 0) markMissing(img);
    else img.addEventListener('error', () => markMissing(img), { once: true });
  });

  /* --- Portfólio: etiqueta "Ver site" que segue o ponteiro --- */
  const tag = $('#cursorTag');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (finePointer && !reduceMotion) {
    let x = 0;
    let y = 0;
    let curX = 0;
    let curY = 0;
    let raf = null;

    const follow = () => {
      curX += (x - curX) * 0.22;
      curY += (y - curY) * 0.22;
      tag.style.transform = `translate(${curX + 14}px, ${curY + 14}px)`;
      raf = tag.classList.contains('is-on') ? requestAnimationFrame(follow) : null;
    };

    $$('.project__link').forEach((link) => {
      link.addEventListener('pointerenter', (e) => {
        tag.firstChild.textContent = `${link.dataset.cursor || 'Ver site'} `;
        x = curX = e.clientX;
        y = curY = e.clientY;
        tag.classList.add('is-on');
        if (!raf) raf = requestAnimationFrame(follow);
      });
      link.addEventListener('pointermove', (e) => {
        x = e.clientX;
        y = e.clientY;
      });
      link.addEventListener('pointerleave', () => tag.classList.remove('is-on'));
    });
  }

  /* --- Canais de contato --- */
  const toast = $('#toast');
  let toastTimer;

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 4200);
  };

  const urlFor = (channel) => {
    const value = CONTATO[channel];
    if (!value) return '';
    if (channel === 'whatsapp') return `https://wa.me/${value.replace(/\D/g, '')}`;
    if (channel === 'email') return `mailto:${value}`;
    return value;
  };

  $$('[data-contact]').forEach((el) => {
    const channel = el.dataset.contact;
    const url = channel === 'principal'
      ? (urlFor('whatsapp') || urlFor('email'))
      : urlFor(channel);

    if (url) {
      el.href = url;
      if (!url.startsWith('mailto:')) {
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
      }
      if (el.dataset.label) el.textContent = el.dataset.label;
    } else {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Canal de contato ainda não configurado: preencha o objeto CONTATO em script.js.');
      });
    }
  });

  /* --- Ano do rodapé --- */
  $('#year').textContent = new Date().getFullYear();
})();
