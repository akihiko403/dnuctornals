document.documentElement.classList.add("js");

const body = document.body;
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll("[data-nav]");
const currentPage = body.dataset.page;
const revealItems = document.querySelectorAll("[data-reveal]");
const counterItems = document.querySelectorAll("[data-counter]");
const activateItems = document.querySelectorAll("[data-activate]");
const parallaxItems = document.querySelectorAll("[data-parallax]");
const parallaxGroups = document.querySelectorAll("[data-parallax-group]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const formatCounterValue = (value, decimals, prefix, suffix) =>
  `${prefix}${Number(value).toFixed(decimals)}${suffix}`;

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    body.classList.toggle("menu-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      body.classList.remove("menu-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (currentPage) {
  navLinks.forEach((link) => {
    if (link.dataset.nav === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
}

const runCounter = (element) => {
  if (element.dataset.counted === "true") {
    return;
  }

  const target = Number(element.dataset.value || 0);
  const decimals = Number(element.dataset.decimals || 0);
  const prefix = element.dataset.prefix || "";
  const suffix = element.dataset.suffix || "";
  const duration = 1200;
  const startTime = performance.now();

  element.dataset.counted = "true";

  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = target * eased;
    element.textContent = formatCounterValue(currentValue, decimals, prefix, suffix);

    if (progress < 1) {
      window.requestAnimationFrame(tick);
    } else {
      element.textContent = formatCounterValue(target, decimals, prefix, suffix);
    }
  };

  if (reduceMotion.matches) {
    element.textContent = formatCounterValue(target, decimals, prefix, suffix);
    return;
  }

  window.requestAnimationFrame(tick);
};

const activateElement = (element) => {
  element.classList.add("is-active");
  element.querySelectorAll("[data-counter]").forEach(runCounter);
};

const revealElement = (element) => {
  element.classList.add("revealed");

  if (element.matches("[data-activate]")) {
    activateElement(element);
  }

  element.querySelectorAll("[data-activate]").forEach(activateElement);
  element.querySelectorAll("[data-counter]").forEach(runCounter);
};

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealElement(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -50px 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const activationObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activateElement(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.35,
      rootMargin: "0px 0px -30px 0px",
    }
  );

  activateItems.forEach((item) => activationObserver.observe(item));

  counterItems.forEach((item) => {
    if (!item.closest("[data-activate]") && !item.closest("[data-reveal]")) {
      activationObserver.observe(item);
    }
  });
} else {
  revealItems.forEach(revealElement);
  activateItems.forEach(activateElement);
  counterItems.forEach(runCounter);
}

const updateScrolledState = () => {
  body.classList.toggle("is-scrolled", window.scrollY > 18);
};

updateScrolledState();
window.addEventListener("scroll", updateScrolledState, { passive: true });

const applyParallax = (items, pointerX, pointerY) => {
  items.forEach((item) => {
    const depth = Number(item.dataset.depth || 0.1);
    item.dataset.pointerX = String(pointerX * depth);
    item.dataset.pointerY = String(pointerY * depth);
    const offsetX = Number(item.dataset.pointerX || 0);
    const offsetY = Number(item.dataset.pointerY || 0);
    const scrollY = Number(item.dataset.scrollY || 0);
    item.style.transform = `translate3d(${offsetX}px, ${offsetY + scrollY}px, 0)`;
  });
};

if (!reduceMotion.matches) {
  window.addEventListener(
    "pointermove",
    (event) => {
      const pointerX = (event.clientX / window.innerWidth - 0.5) * 16;
      const pointerY = (event.clientY / window.innerHeight - 0.5) * 16;

      applyParallax(parallaxItems, pointerX, pointerY);

      parallaxGroups.forEach((group) => {
        const layers = group.querySelectorAll("[data-parallax-layer]");
        applyParallax(layers, pointerX, pointerY);
      });
    },
    { passive: true }
  );

  window.addEventListener(
    "scroll",
    () => {
      const scrollOffset = window.scrollY * -0.02;

      parallaxItems.forEach((item) => {
        const depth = Number(item.dataset.depth || 0.12);
        item.dataset.scrollY = String(scrollOffset * depth * 18);
        const offsetX = Number(item.dataset.pointerX || 0);
        const offsetY = Number(item.dataset.pointerY || 0);
        const scrollY = Number(item.dataset.scrollY || 0);
        item.style.transform = `translate3d(${offsetX}px, ${offsetY + scrollY}px, 0)`;
      });
    },
    { passive: true }
  );
}

document.addEventListener("submit", (event) => {
  if (event.target.matches(".contact-form")) {
    event.preventDefault();
  }
});
