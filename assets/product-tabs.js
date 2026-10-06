if (!customElements.get('product-tabs')) {
  customElements.define(
    'product-tabs',
    class ProductTabs extends HTMLElement {
      static FADE_OUT = 180;
      static RESIZE = 350;

      connectedCallback() {
        this.tabs = Array.from(this.querySelectorAll('[role="tab"]'));
        this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.tabs.forEach((tab) => {
          tab.addEventListener('click', () => this.select(tab));
          tab.addEventListener('keydown', this.onKeyDown.bind(this));
        });
      }

      panelFor(tab) {
        return this.querySelector(`#${tab.getAttribute('aria-controls')}`);
      }

      select(tab, focus = false) {
        const nextPanel = this.panelFor(tab);
        // The panel actually on screen (during a quick second click this can differ from the selected tab)
        const currentPanel = this.tabs.map((item) => this.panelFor(item)).find((panel) => panel && !panel.hidden);

        this.tabs.forEach((item) => {
          const selected = item === tab;
          item.setAttribute('aria-selected', selected);
          item.setAttribute('tabindex', selected ? '0' : '-1');
        });
        if (focus) tab.focus();

        if (!nextPanel || nextPanel === currentPanel) return;

        if (this.reduceMotion || !currentPanel) {
          this.showOnly(nextPanel);
          nextPanel.classList.remove('is-leaving', 'is-entering', 'is-entered');
          return;
        }

        this.animateSwap(currentPanel, nextPanel);
      }

      showOnly(panel) {
        this.tabs.forEach((item) => {
          const itemPanel = this.panelFor(item);
          if (!itemPanel) return;
          itemPanel.hidden = itemPanel !== panel;
          if (itemPanel !== panel) itemPanel.classList.remove('is-leaving', 'is-entering', 'is-entered');
        });
      }

      // Fade the current panel out, swap, then fade the new one in while the height glides to fit.
      animateSwap(currentPanel, nextPanel) {
        const run = (this.runId = (this.runId || 0) + 1);
        clearTimeout(this.fadeTimer);
        clearTimeout(this.resizeTimer);

        const startHeight = this.offsetHeight;
        this.style.height = `${startHeight}px`;
        this.style.overflow = 'hidden';

        currentPanel.classList.remove('is-entering');
        currentPanel.classList.add('is-leaving');

        this.fadeTimer = setTimeout(() => {
          if (run !== this.runId) return;

          currentPanel.classList.remove('is-leaving');
          this.showOnly(nextPanel);
          nextPanel.classList.add('is-entering');

          // Measure the natural height of the new content, then animate from the old height to it.
          this.style.height = 'auto';
          const targetHeight = this.offsetHeight;
          this.style.height = `${startHeight}px`;
          this.offsetHeight; // apply the start height and the is-entering state before transitioning
          this.style.transition = `height ${ProductTabs.RESIZE}ms ease`;
          this.style.height = `${targetHeight}px`;
          nextPanel.classList.add('is-entered');

          this.resizeTimer = setTimeout(() => {
            if (run !== this.runId) return;
            this.style.height = '';
            this.style.overflow = '';
            this.style.transition = '';
            nextPanel.classList.remove('is-entering', 'is-entered');
          }, ProductTabs.RESIZE + 400);
        }, ProductTabs.FADE_OUT);
      }

      onKeyDown(event) {
        const index = this.tabs.indexOf(event.currentTarget);
        let next;
        if (event.key === 'ArrowRight') next = this.tabs[(index + 1) % this.tabs.length];
        if (event.key === 'ArrowLeft') next = this.tabs[(index - 1 + this.tabs.length) % this.tabs.length];
        if (event.key === 'Home') next = this.tabs[0];
        if (event.key === 'End') next = this.tabs[this.tabs.length - 1];
        if (!next) return;
        event.preventDefault();
        this.select(next, true);
      }
    }
  );
}
