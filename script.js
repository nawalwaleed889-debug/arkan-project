/* ARKAN interactions — edit contact details and project content in index.html */
document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Loader
  const loader = $("#loader");
  window.addEventListener("load", () => setTimeout(() => loader?.classList.add("done"), 350));
  setTimeout(() => loader?.classList.add("done"), 2200); // fallback if a remote image is slow

  // Header, mobile navigation and scroll-to-top
  const header = $(".site-header"), menuToggle = $("#menuToggle"), navLinks = $("#navLinks"), toTop = $("#toTop");
  const closeMenu = () => { navLinks.classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false"); };
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
  $$("#navLinks a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("click", e => {
    if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) closeMenu();
  });
  const sections = $$("main section[id]");
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 20);
    toTop.classList.toggle("visible", y > 500);
    let current = "home";
    sections.forEach(section => { if (y >= section.offsetTop - 160) current = section.id; });
    $$("#navLinks a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${current}`));
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Theme toggle; choice persists on this browser
  const themeToggle = $("#themeToggle");
  const savedTheme = localStorage.getItem("arkan-theme");
  if (savedTheme === "dark") document.body.classList.add("dark-mode");
  function updateThemeIcon() { $(".theme-icon").textContent = document.body.classList.contains("dark-mode") ? "☾" : "☼"; }
  updateThemeIcon();
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("arkan-theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    updateThemeIcon();
  });

  // Scroll reveal
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("revealed"); revealObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach(el => revealObserver.observe(el));

  // Animated stats
  const stats = $$(".stat strong");
  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target, target = Number(el.dataset.count), suffix = el.dataset.suffix || "";
      const start = performance.now(), duration = 1500;
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick); countObserver.unobserve(el);
    });
  }, { threshold: .6 });
  stats.forEach(el => countObserver.observe(el));

  // Project category filtering
  const filterButtons = $$(".filter-btn"), projectCards = $$(".project-card");
  filterButtons.forEach(button => button.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active")); button.classList.add("active");
    const filter = button.dataset.filter;
    projectCards.forEach(card => {
      const show = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !show);
      if (show) { card.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 350, easing: "ease-out" }); }
    });
  }));

  // Project details modal
  const projectModal = $("#projectModal");
  projectCards.forEach(card => card.addEventListener("click", () => {
    $("#modalImage").src = card.dataset.image;
    $("#modalImage").alt = card.dataset.title;
    $("#modalTitle").textContent = card.dataset.title;
    $("#modalLocation").textContent = card.dataset.location;
    $("#modalDescription").textContent = card.dataset.description;
    projectModal.classList.add("open"); projectModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }));
  function closeProjectModal() { projectModal.classList.remove("open"); projectModal.setAttribute("aria-hidden", "true"); document.body.classList.remove("no-scroll"); }
  $$("[data-close]", projectModal).forEach(el => el.addEventListener("click", closeProjectModal));
  $("#modalContact").addEventListener("click", closeProjectModal);

  // Gallery lightbox
  const lightbox = $("#lightbox"), lightboxImage = $("#lightboxImage");
  $$(".gallery-item").forEach(item => item.addEventListener("click", () => {
    lightboxImage.src = item.dataset.full; lightboxImage.alt = $("img", item).alt;
    lightbox.classList.add("open"); lightbox.setAttribute("aria-hidden", "false"); document.body.classList.add("no-scroll");
  }));
  function closeLightbox() { lightbox.classList.remove("open"); lightbox.setAttribute("aria-hidden", "true"); document.body.classList.remove("no-scroll"); }
  $$("[data-lightbox-close]").forEach(el => el.addEventListener("click", closeLightbox));
  lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeProjectModal(); closeLightbox(); closeMenu(); }
  });

  // Testimonials slider
  const testimonials = [
    { text: "التعامل مع فريق أركان كان تجربة مريحة من أول خطوة. اهتمامهم بالتفاصيل ووضوحهم في كل مرحلة صنع فارقًا حقيقيًا في النتيجة.", name: "محمد ع.", role: "عميل — تشطيبات سكنية", avatar: "م" },
    { text: "أكثر ما أعجبني هو الالتزام والشفافية. كنت على اطلاع بكل مرحلة، والنتيجة النهائية جاءت قريبة جدًا من الصورة التي تخيلتها.", name: "سارة م.", role: "عميلة — تصميم داخلي", avatar: "س" },
    { text: "فريق متعاون واهتمام واضح بجودة التنفيذ. تجربة إيجابية وأتمنى تكرار التعاون في مشروعات قادمة.", name: "أحمد ك.", role: "عميل — مشروع تجاري", avatar: "أ" }
  ];
  let testimonialIndex = 0;
  function showTestimonial(index) {
    testimonialIndex = (index + testimonials.length) % testimonials.length;
    const item = testimonials[testimonialIndex];
    $("#quoteText").textContent = item.text; $("#quoteName").textContent = item.name;
    $("#quoteRole").textContent = item.role; $("#quoteAvatar").textContent = item.avatar;
    $$("#sliderDots button").forEach((dot, i) => dot.classList.toggle("active", i === testimonialIndex));
  }
  $("#prevTestimonial").addEventListener("click", () => showTestimonial(testimonialIndex - 1));
  $("#nextTestimonial").addEventListener("click", () => showTestimonial(testimonialIndex + 1));
  $$("#sliderDots button").forEach((dot, i) => dot.addEventListener("click", () => showTestimonial(i)));

  // Front-end form validation. Connect to an email/API endpoint to deliver messages.
  const form = $("#contactForm"), feedback = $("#formFeedback");
  form.addEventListener("submit", e => {
    e.preventDefault(); feedback.className = "form-feedback";
    if (!form.checkValidity()) {
      form.reportValidity(); feedback.textContent = "يرجى مراجعة البيانات المطلوبة والتأكد من صحتها."; feedback.classList.add("error"); return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    // Demo behavior only: no message is sent until a backend or form service is connected.
    console.info("ARKAN contact form submission (demo):", data);
    feedback.textContent = "شكرًا لاهتمامك بأركان! تم تسجيل بياناتك تجريبيًا. اربط النموذج بخدمة إرسال لتلقي الطلبات فعليًا.";
    feedback.classList.add("success"); form.reset();
  });

  $("#year").textContent = new Date().getFullYear();
});
