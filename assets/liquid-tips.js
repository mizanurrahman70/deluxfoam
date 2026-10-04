/*
 * Cycles the Liquid tips card to a different server-rendered tip.
 * Every tip is rendered in the markup; only one is visible at a time.
 */
document.querySelectorAll("[data-liquid-tips]").forEach((card) => {
  const control = card.querySelector("[data-refresh-tip]");
  const tips = Array.from(card.querySelectorAll("[data-tip]"));

  if (!control || tips.length < 2) {
    return;
  }

  /* Briefly flashes the tip so the swapped-in content is noticeable. */
  function flashTip(tip) {
    tip.classList.add("highlight-description--flash");
    tip.addEventListener(
      "animationend",
      () => tip.classList.remove("highlight-description--flash"),
      { once: true },
    );
  }

  function refresh() {
    const current = tips.findIndex((tip) => !tip.hidden);
    const offset = 1 + Math.floor(Math.random() * (tips.length - 1));
    const next = tips[(current + offset) % tips.length];

    tips.forEach((tip) => {
      tip.hidden = tip !== next;
    });
    flashTip(next);
  }

  control.addEventListener("click", refresh);
  control.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      refresh();
    }
  });
});
