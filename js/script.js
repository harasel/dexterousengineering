/* ==========================================================================
   Dexterous Engineering — site scripts (vanilla JS, no dependencies)
   Modules: preloader · header · drawer · reveal · filters · accordion ·
            enquiry form · share · scroll-spy · footer year
   Each module is independent and only runs if its markup exists.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Preloader ---------------------------------------------------------
     Shown only when JS is enabled (see .js .preloader in CSS — no-JS visitors
     never see it). Hides on window 'load', with a timeout fallback so a slow
     asset can never block the page indefinitely. ------------------------- */
  function initPreloader() {
    var el = $('#preloader');
    if (!el) return;
    var hidden = false;
    function hide() {
      if (hidden) return;
      hidden = true;
      el.classList.add('is-hidden');
      el.setAttribute('aria-hidden', 'true');
      window.setTimeout(function () {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }, 600);
    }
    if (document.readyState === 'complete') hide();
    else window.addEventListener('load', hide);
    window.setTimeout(hide, 3500); /* safety net */
  }

  /* ---- Header: shadow once the page is scrolled ------------------------- */
  function initHeader() {
    var header = $('.site-header');
    if (!header) return;
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Mobile drawer ----------------------------------------------------- */
  function initDrawer() {
    var btn = $('.menu-btn');
    var drawer = $('#drawer');
    var scrim = $('.scrim');
    if (!btn || !drawer) return;
    var closeBtn = $('.drawer-close', drawer);
    var lastFocus = null;

    function focusables() {
      return $$('a[href], button:not([disabled])', drawer);
    }
    function open() {
      lastFocus = document.activeElement;
      document.body.classList.add('nav-open');
      btn.setAttribute('aria-expanded', 'true');
      drawer.removeAttribute('inert');
      window.setTimeout(function () { if (closeBtn) closeBtn.focus(); }, 60);
    }
    function close() {
      document.body.classList.remove('nav-open');
      btn.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('inert', '');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    drawer.setAttribute('inert', '');
    btn.addEventListener('click', function () {
      document.body.classList.contains('nav-open') ? close() : open();
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (scrim) scrim.addEventListener('click', close);
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) {
      if (!document.body.classList.contains('nav-open')) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') {
        var f = focusables();
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1180 && document.body.classList.contains('nav-open')) close();
    });
  }

  /* ---- Scroll reveal ----------------------------------------------------- */
  function initReveal() {
    var items = $$('.reveal, .reveal-media');
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---- Filters (projects, news) ------------------------------------------ */
  function initFilters() {
    $$('[data-filter-group]').forEach(function (group) {
      var buttons = $$('[data-filter]', group);
      var scope = group.parentElement || document;
      var items = $$('[data-filter-item]', scope);
      var status = $('[data-filter-status]', scope);
      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var value = btn.getAttribute('data-filter');
          buttons.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
          var shown = 0;
          items.forEach(function (item) {
            var cats = (item.getAttribute('data-category') || '').split(' ');
            var match = value === 'all' || cats.indexOf(value) !== -1;
            item.hidden = !match;
            if (match) {
              shown++;
              item.classList.add('is-visible');
            }
          });
          if (status) status.textContent = shown + (shown === 1 ? ' item shown' : ' items shown');
        });
      });
    });
  }

  /* ---- Accordion: one open at a time within a group ---------------------- */
  function initAccordion() {
    $$('.accordion').forEach(function (acc) {
      var all = $$('details', acc);
      all.forEach(function (d) {
        d.addEventListener('toggle', function () {
          if (!d.open) return;
          all.forEach(function (o) { if (o !== d) o.open = false; });
        });
      });
    });
  }

  /* ---- Enquiry form: validation + mailto hand-off ------------------------- */
  function initEnquiryForm() {
    var form = $('form[data-enquiry]');
    if (!form) return;
    var status = $('.form-status', form.parentElement);
    var to = form.getAttribute('data-mailto') || 'sales@dexterousengineering.com';
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function setInvalid(field, invalid, msg) {
      var wrap = field.closest('.field');
      if (!wrap) return;
      wrap.classList.toggle('is-invalid', invalid);
      field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
      var err = $('.field-error', wrap);
      if (err && msg) err.textContent = msg;
    }
    function validate(field) {
      var v = (field.value || '').trim();
      if (field.required && !v) { setInvalid(field, true, 'Please complete this field.'); return false; }
      if (field.type === 'email' && v && !emailRe.test(v)) { setInvalid(field, true, 'Enter a valid email address.'); return false; }
      setInvalid(field, false);
      return true;
    }
    $$('input, select, textarea', form).forEach(function (f) {
      f.addEventListener('blur', function () { validate(f); });
      f.addEventListener('input', function () { if (f.closest('.field').classList.contains('is-invalid')) validate(f); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = $$('input, select, textarea', form);
      var ok = true, firstBad = null;
      fields.forEach(function (f) { if (!validate(f)) { ok = false; if (!firstBad) firstBad = f; } });
      if (!ok) { firstBad.focus(); return; }
      var data = {};
      fields.forEach(function (f) { data[f.name] = (f.value || '').trim(); });
      var subject = 'Website enquiry' + (data.interest ? ' — ' + data.interest : '');
      var body = [
        'Name: ' + data.name,
        'Company: ' + (data.company || '-'),
        'Phone: ' + (data.phone || '-'),
        'Email: ' + data.email,
        'Area of interest: ' + (data.interest || '-'),
        '',
        data.message
      ].join('\n');
      if (status) {
        status.hidden = false;
        status.innerHTML = '<div class="notice"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><p><strong>Your email app should now open with this enquiry ready to send.</strong> If nothing opens, email us directly at <a href="mailto:' + to + '">' + to + '</a>.</p></div>';
      }
      window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }

  /* ---- Share buttons (article) ------------------------------------------- */
  function initShare() {
    var groups = $$('.share');
    if (!groups.length) return;
    var pageUrl = window.location.href.split('#')[0];
    var enc = encodeURIComponent(pageUrl);
    function legacyCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (err) { /* ignore */ }
      document.body.removeChild(ta);
    }
    groups.forEach(function (group) {
      var status = $('.share-status', group);
      $$('[data-share]', group).forEach(function (el) {
        var type = el.getAttribute('data-share');
        if (type === 'linkedin') el.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + enc;
        if (type === 'facebook') el.href = 'https://www.facebook.com/sharer/sharer.php?u=' + enc;
        if (type === 'copy') {
          el.addEventListener('click', function () {
            var done = function () {
              el.classList.add('is-copied');
              if (status) status.textContent = 'Link copied';
              window.setTimeout(function () {
                el.classList.remove('is-copied');
                if (status) status.textContent = '';
              }, 2200);
            };
            if (navigator.clipboard && window.isSecureContext) {
              navigator.clipboard.writeText(pageUrl).then(done, function () { legacyCopy(pageUrl); done(); });
            } else { legacyCopy(pageUrl); done(); }
          });
        }
      });
    });
  }

  /* ---- Scroll-spy for the Solutions side index --------------------------- */
  function initScrollSpy() {
    var links = $$('.side-index a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var current = null;
    var visible = {};
    function apply() {
      var topId = null, topPos = Infinity;
      Object.keys(visible).forEach(function (id) {
        if (visible[id] && visible[id] < topPos) { topPos = visible[id]; topId = id; }
      });
      if (!topId) return;
      if (current) current.removeAttribute('aria-current');
      current = map[topId];
      if (current) current.setAttribute('aria-current', 'true');
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting ? entry.boundingClientRect.top : null;
      });
      apply();
    }, { rootMargin: '-15% 0px -75% 0px' });
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) io.observe(sec);
    });
  }

  /* ---- Footer year ------------------------------------------------------- */
  function initYear() {
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  function init() {
    initPreloader();
    initHeader(); initDrawer(); initReveal(); initFilters(); initAccordion();
    initEnquiryForm(); initShare(); initScrollSpy(); initYear();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
