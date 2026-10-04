if (!customElements.get('load-more-products')) {
  customElements.define(
    'load-more-products',
    class LoadMoreProducts extends HTMLElement {
      connectedCallback() {
        this.button = this.querySelector('[data-next-url]');
        if (!this.button) return;
        this.button.addEventListener('click', this.onClick.bind(this));
      }

      async onClick(event) {
        event.preventDefault();
        if (this.button.getAttribute('aria-busy') === 'true') return;

        const url = new URL(this.button.dataset.nextUrl, window.location.origin);
        url.searchParams.set('section_id', this.dataset.sectionId);

        this.button.setAttribute('aria-busy', 'true');
        this.button.classList.add('loading');
        this.button.querySelector('.loading__spinner')?.classList.remove('hidden');

        try {
          const response = await fetch(url.toString());
          const html = new DOMParser().parseFromString(await response.text(), 'text/html');
          const grid = document.getElementById('product-grid');
          const newItems = html.querySelectorAll('#product-grid > li');
          newItems.forEach((item) => grid.appendChild(document.importNode(item, true)));

          if (typeof initializeScrollAnimationTrigger === 'function') {
            initializeScrollAnimationTrigger(grid.innerHTML);
          }

          const nextLoadMore = html.querySelector('load-more-products');
          if (nextLoadMore) {
            this.replaceWith(document.importNode(nextLoadMore, true));
          } else {
            this.remove();
          }
        } catch (error) {
          console.error(error);
          window.location.href = this.button.dataset.nextUrl;
        }
      }
    }
  );
}
