(() => {
  "use strict";

  const root = document.documentElement;
  const themeButton = document.querySelector("[data-theme-toggle]");
  const storageKey = "xingbing-theme";
  const systemTheme = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  const storedTheme = () => {
    try { return localStorage.getItem(storageKey); }
    catch (error) { return null; }
  };

  const saveTheme = theme => {
    try { localStorage.setItem(storageKey, theme); }
    catch (error) {}
  };

  const applyTheme = theme => {
    const dark = theme === "dark";
    root.dataset.theme = dark ? "dark" : "light";

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = dark ? "#0c1624" : "#ffffff";

    if (!themeButton) return;
    const label = dark ? themeButton.dataset.lightLabel : themeButton.dataset.darkLabel;
    themeButton.setAttribute("aria-pressed", String(dark));
    themeButton.setAttribute("aria-label", label);
    themeButton.title = label;

    const labelElement = themeButton.querySelector("[data-theme-label]");
    const iconElement = themeButton.querySelector("[data-theme-icon]");
    if (labelElement) labelElement.textContent = label;
    if (iconElement) iconElement.textContent = dark ? "☀" : "☾";
  };

  const initialTheme = root.dataset.theme === "dark" ? "dark" : "light";
  applyTheme(initialTheme);

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      saveTheme(next);
    });
  }

  if (systemTheme && typeof systemTheme.addEventListener === "function") {
    systemTheme.addEventListener("change", event => {
      if (!storedTheme()) applyTheme(event.matches ? "dark" : "light");
    });
  }

  const links = [...document.querySelectorAll(".nav-tile[data-section]")];
  const sections = links
    .map(link => document.getElementById(link.dataset.section))
    .filter(Boolean);

  const setActive = id => {
    links.forEach(link => {
      const active = link.dataset.section === id;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  links.forEach(link => {
    link.addEventListener("click", () => setActive(link.dataset.section));
  });

  if ("IntersectionObserver" in window && sections.length) {
    const visible = new Map();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0));
      const current = [...visible.entries()]
        .filter(([, ratio]) => ratio > 0)
        .sort((a, b) => b[1] - a[1])[0];
      if (current) setActive(current[0]);
    }, {
      rootMargin: "-12% 0px -62% 0px",
      threshold: [0, 0.1, 0.25, 0.5]
    });
    sections.forEach(section => observer.observe(section));
  }
})();
