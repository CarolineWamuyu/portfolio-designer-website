/* ==========================================================
   Alex Morgan — Portfolio
   Vanilla JavaScript: nav, typing effect, scroll animations,
   counters, skill bars, carousel, timeline, form validation.
   ========================================================== */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile navigation ---------- */
  const navToggle = $("#navToggle");
  const navMenu = $("#navMenu");

  function setMenu(open) {
    navMenu.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }

  navToggle.addEventListener("click", () => setMenu(!navMenu.classList.contains("open")));
  $$(".nav-link", navMenu).forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu.classList.contains("open")) {
      setMenu(false);
      navToggle.focus();
    }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900 && navMenu.classList.contains("open")) setMenu(false);
  });

  /* ---------- Header state, scroll progress, back-to-top ---------- */
  const header = $("#header");
  const progress = $("#scrollProgress");
  const toTop = $("#toTop");
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("scrolled", y > 30);
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    toTop.classList.toggle("show", y > 600);
    updateTimeline();
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  toTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ---------- Active nav link on scroll ---------- */
  const navLinks = $$(".nav-link");
  const sections = navLinks
    .map((a) => $(a.getAttribute("href")))
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id)
          );
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => sectionObserver.observe(s));

  /* ---------- Typing effect (type + delete, rotating titles) ---------- */
  const typingEl = $("#typing");
  const roles = ["UI/UX Designer", "Frontend Developer", "Creative Developer"];

  if (reduceMotion) {
    typingEl.textContent = roles[0];
  } else {
    let roleIdx = 0;
    let charIdx = 0;
    let deleting = false;

    (function tick() {
      const word = roles[roleIdx];
      charIdx += deleting ? -1 : 1;
      typingEl.textContent = word.slice(0, charIdx);

      let delay = deleting ? 45 : 95;
      if (!deleting && charIdx === word.length) {
        deleting = true;
        delay = 1500; // pause on the finished word
      } else if (deleting && charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        delay = 450;
      }
      setTimeout(tick, delay);
    })();
  }

  /* ---------- Animated counters ---------- */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10) || 0;
    if (reduceMotion) { el.textContent = target; return; }
    const duration = 1800;
    const start = performance.now();
    (function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }

  /* ---------- Scroll-reveal animations (Intersection Observer) ---------- */
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("in-view");
        $$(".counter", el).forEach(animateCounter);
        if (el.classList.contains("counter")) animateCounter(el);
        obs.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".anim").forEach((el) => revealObserver.observe(el));

  /* ---------- Skill bars ---------- */
  const skillBars = $$(".skill-bar span");
  const skillObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        skillBars.forEach((bar) => (bar.style.width = bar.dataset.level + "%"));
        obs.disconnect();
      });
    },
    { threshold: 0.3 }
  );
  const skillsWrap = $("#skills");
  if (skillsWrap) skillObserver.observe(skillsWrap);

  /* ---------- Testimonials carousel ---------- */
  const track = $("#carouselTrack");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");
  const dotsWrap = $("#carouselDots");
  const cards = $$(".testimonial", track);

  function stepSize() {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return cards[0].offsetWidth + gap;
  }

  function buildDots() {
    dotsWrap.innerHTML = "";
    cards.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.tabIndex = -1;
      dot.addEventListener("click", () => track.scrollTo({ left: i * stepSize(), behavior: reduceMotion ? "auto" : "smooth" }));
      dotsWrap.appendChild(dot);
    });
  }

  function updateCarousel() {
    const idx = Math.round(track.scrollLeft / stepSize());
    $$("button", dotsWrap).forEach((d, i) => d.classList.toggle("active", i === idx));
    prevBtn.disabled = track.scrollLeft <= 4;
    nextBtn.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
  }

  prevBtn.addEventListener("click", () => track.scrollBy({ left: -stepSize(), behavior: reduceMotion ? "auto" : "smooth" }));
  nextBtn.addEventListener("click", () => track.scrollBy({ left: stepSize(), behavior: reduceMotion ? "auto" : "smooth" }));
  track.addEventListener("scroll", updateCarousel, { passive: true });
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); nextBtn.click(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); prevBtn.click(); }
  });
  window.addEventListener("resize", updateCarousel);
  buildDots();
  updateCarousel();

  /* ---------- Timeline connecting-line fill ---------- */
  const timeline = $(".timeline");
  const timelineFill = $("#timelineFill");

  function updateTimeline() {
    if (!timeline) return;
    const rect = timeline.getBoundingClientRect();
    const mid = window.innerHeight * 0.55;
    const pct = Math.min(Math.max((mid - rect.top) / rect.height, 0), 1);
    timelineFill.style.height = pct * 100 + "%";
  }

  /* ---------- Contact form validation ---------- */
  const form = $("#contactForm");
  const statusEl = $("#formStatus");
  const recipient = form.dataset.recipient;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const rules = {
    name: (v) => (v.trim().length < 2 ? "Please enter your name (at least 2 characters)." : ""),
    email: (v) => (!emailPattern.test(v.trim()) ? "Please enter a valid email address." : ""),
    subject: (v) => (v.trim().length < 3 ? "Please add a short subject." : ""),
    message: (v) => (v.trim().length < 10 ? "Your message should be at least 10 characters." : ""),
  };

  function validateField(name) {
    const input = form.elements[name];
    const msg = rules[name](input.value);
    const field = input.closest(".field");
    field.classList.toggle("invalid", Boolean(msg));
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    $("#" + name + "Error").textContent = msg;
    return !msg;
  }

  Object.keys(rules).forEach((name) => {
    const input = form.elements[name];
    input.addEventListener("blur", () => validateField(name));
    input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("invalid")) validateField(name);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    statusEl.className = "form-status";
    statusEl.textContent = "";

    const results = Object.keys(rules).map(validateField);
    if (results.includes(false)) {
      statusEl.classList.add("fail");
      statusEl.textContent = "Please fix the highlighted fields and try again.";
      const firstBad = Object.keys(rules).find((n) => form.elements[n].closest(".field").classList.contains("invalid"));
      if (firstBad) form.elements[firstBad].focus();
      return;
    }

    if (!recipient) {
      statusEl.classList.add("fail");
      statusEl.textContent = "The email destination is not configured. Please use the contact email shown here.";
      return;
    }

    const subject = "Consultation inquiry: " + form.elements.subject.value.trim();
    const body = [
      "Name: " + form.elements.name.value.trim(),
      "Reply email: " + form.elements.email.value.trim(),
      "",
      form.elements.message.value.trim(),
    ].join("\n");
    const mailto = "mailto:" + recipient
      + "?subject=" + encodeURIComponent(subject)
      + "&body=" + encodeURIComponent(body);

    statusEl.textContent = "Opening your email app. Review the message and send it to complete your inquiry.";
    window.location.href = mailto;
  });

  /* ---------- Placeholder "View Project" links ---------- */
  $$('a[href="#"]').forEach((a) =>
    a.addEventListener("click", (e) => e.preventDefault())
  );

  // Initial state
  onScroll();
})();
