if (!customElements.get('wishlist-button')) {
  customElements.define(
    'wishlist-button',
    class WishlistButton extends HTMLElement {
      static storageKey = 'theme:wishlist';

      static read() {
        try {
          return JSON.parse(window.localStorage.getItem(WishlistButton.storageKey)) || [];
        } catch (error) {
          return [];
        }
      }

      static write(list) {
        try {
          window.localStorage.setItem(WishlistButton.storageKey, JSON.stringify(list));
        } catch (error) {
          // Storage can be unavailable in private windows; the button still toggles for this page view.
        }
      }

      connectedCallback() {
        this.button = this.querySelector('button');
        this.label = this.querySelector('.wishlist-button__label');
        if (!this.button) return;
        this.render(WishlistButton.read().includes(this.dataset.handle));
        this.button.addEventListener('click', this.toggle.bind(this));
      }

      toggle() {
        const list = WishlistButton.read();
        const handle = this.dataset.handle;
        const saved = !list.includes(handle);
        WishlistButton.write(saved ? [...list, handle] : list.filter((item) => item !== handle));
        this.render(saved);
      }

      render(saved) {
        this.button.setAttribute('aria-pressed', saved);
        this.classList.toggle('is-saved', saved);
        if (this.label) this.label.textContent = saved ? this.label.dataset.labelRemove : this.label.dataset.labelAdd;
      }
    }
  );
}
