if (!customElements.get('showcase-slider')) {
  customElements.define(
    'showcase-slider',
    class ShowcaseSlider extends HTMLElement {
      connectedCallback() {
        this.list = this.querySelector('.product-showcase__grid');
        this.prevButton = this.querySelector('button[name="previous"]');
        this.nextButton = this.querySelector('button[name="next"]');
        if (!this.list) return;

        this.prevButton.addEventListener('click', () => this.go(-1));
        this.nextButton.addEventListener('click', () => this.go(1));
        this.list.addEventListener('scroll', () => this.update(), { passive: true });

        // Also fires when a hidden tab panel becomes visible
        this.resizeObserver = new ResizeObserver(() => this.update());
        this.resizeObserver.observe(this.list);
        this.update();
      }

      disconnectedCallback() {
        if (this.resizeObserver) this.resizeObserver.disconnect();
      }

      go(direction) {
        this.list.scrollBy({ left: direction * this.list.clientWidth, behavior: 'smooth' });
      }

      update() {
        // Two rows only when the cards don't fit in one row
        const columns = parseInt(getComputedStyle(this.list).getPropertyValue('--slider-columns'), 10) || 1;
        const count = this.list.children.length;
        const rows = Math.max(1, Math.min(Number(this.dataset.rows) || 1, Math.ceil(count / columns)));
        this.list.style.setProperty('--slider-rows', rows);

        const maxScroll = this.list.scrollWidth - this.list.clientWidth;
        const scrollable = maxScroll > 1;
        this.classList.toggle('is-scrollable', scrollable);
        this.prevButton.disabled = !scrollable || this.list.scrollLeft <= 1;
        this.nextButton.disabled = !scrollable || this.list.scrollLeft >= maxScroll - 1;
      }
    }
  );
}
