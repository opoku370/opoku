/* Portfolio interactions */

(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Sticky nav border on scroll */
  const nav = document.querySelector(".site-nav");
  const onScrollNav = () => {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  /* Mobile menu */
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  const setMenuOpen = (open) => {
    if (!nav || !navToggle) return;
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      setMenuOpen(!nav.classList.contains("is-open"));
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    });

    window.addEventListener(
      "resize",
      () => {
        if (window.innerWidth > 720) setMenuOpen(false);
      },
      { passive: true }
    );
  }

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* Hero flow canvas */
  const canvas = document.getElementById("flowCanvas");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (canvas && canvas.getContext && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;
    let raf = 0;
    const nodes = [];
    const NODE_COUNT = 42;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      nodes.length = 0;
      for (let i = 0; i < NODE_COUNT; i += 1) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: 1.2 + Math.random() * 1.8,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;

        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.35;
            ctx.strokeStyle = `rgba(46, 196, 182, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = "rgba(94, 234, 212, 0.75)";
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    seed();
    draw();
    window.addEventListener(
      "resize",
      () => {
        resize();
        seed();
      },
      { passive: true }
    );

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        raf = requestAnimationFrame(draw);
      }
    });
  }

  /* Lakehouse pipeline tabs */
  document.querySelectorAll("[data-pipeline]").forEach((pipeline) => {
    const tabs = pipeline.querySelectorAll(".pipeline-tab");
    const panels = pipeline.querySelectorAll(".pipeline-panel");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const layer = tab.getAttribute("data-layer");
        tabs.forEach((t) => {
          const active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", active ? "true" : "false");
        });
        panels.forEach((panel) => {
          const match = panel.getAttribute("data-panel") === layer;
          panel.classList.toggle("is-active", match);
          if (match) {
            panel.removeAttribute("hidden");
          } else {
            panel.setAttribute("hidden", "");
          }
        });
      });
    });
  });

  /* Diabetes demo scorer — same feature set as the project; transparent rules */
  const form = document.getElementById("diabetesForm");
  const result = document.getElementById("predictorResult");
  const resultMeta = document.getElementById("resultMeta");

  const bmiCategory = (bmi) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  const estimateRisk = ({ age, sugar, weight, height }) => {
    const bmi = weight / (height / 100) ** 2;
    let score = 0;
    const reasons = [];

    if (sugar >= 200) {
      score += 3;
      reasons.push("sugar ≥ 200 mg/dL");
    } else if (sugar >= 140) {
      score += 2;
      reasons.push("sugar ≥ 140 mg/dL");
    } else if (sugar >= 100) {
      score += 1;
      reasons.push("sugar ≥ 100 mg/dL");
    }

    if (bmi >= 30) {
      score += 2;
      reasons.push("BMI obese");
    } else if (bmi >= 25) {
      score += 1;
      reasons.push("BMI overweight");
    }

    if (age >= 35) {
      score += 1;
      reasons.push("age ≥ 35");
    }

    const elevated = score >= 3;
    return {
      elevated,
      bmi,
      category: bmiCategory(bmi),
      reasons: reasons.length ? reasons : ["no elevated flags on sugar/BMI/age rules"],
      score,
    };
  };

  if (form && result) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const age = Number(form.age.value);
      const sugar = Number(form.sugar.value);
      const weight = Number(form.weight.value);
      const height = Number(form.height.value);

      if (![age, sugar, weight, height].every((n) => Number.isFinite(n) && n > 0)) {
        result.dataset.state = "idle";
        result.querySelector(".result-verdict").textContent = "Check your inputs";
        result.querySelector(".result-detail").textContent =
          "Age, sugar, weight, and height need valid positive numbers.";
        if (resultMeta) resultMeta.textContent = "";
        return;
      }

      const estimate = estimateRisk({ age, sugar, weight, height });
      result.dataset.state = estimate.elevated ? "risk" : "clear";
      result.querySelector(".result-verdict").textContent = estimate.elevated
        ? "Elevated risk signal"
        : "Lower risk signal";
      result.querySelector(".result-detail").textContent = estimate.elevated
        ? "Rule layer flagged elevated risk from the same features used in the ML project. Confirm with clinical screening — this is not a diagnosis."
        : "Rule layer did not flag elevated risk on sugar/BMI/age thresholds. The notebook SVM remains the project’s trained model.";
      if (resultMeta) {
        resultMeta.textContent = `BMI ${estimate.bmi.toFixed(1)} (${estimate.category}) · drivers: ${estimate.reasons.join(", ")}`;
      }
    });
  }
})();
