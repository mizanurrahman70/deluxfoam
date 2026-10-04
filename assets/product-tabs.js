if (!customElements.get('product-tabs')) {
  customElements.define(
    'product-tabs',
    class ProductTabs extends HTMLElement {
      connectedCallback() {
        this.tabs = Array.from(this.querySelectorAll('[role="tab"]'));
        this.tabs.forEach((tab) => {
          tab.addEventListener('click', () => this.select(tab));
          tab.addEventListener('keydown', this.onKeyDown.bind(this));
        });
      }

      select(tab, focus = false) {
        this.tabs.forEach((item) => {
          const selected = item === tab;
          item.setAttribute('aria-selected', selected);
          item.setAttribute('tabindex', selected ? '0' : '-1');
          const panel = this.querySelector(`#${item.getAttribute('aria-controls')}`);
          if (panel) panel.hidden = !selected;
        });
        if (focus) tab.focus();
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
