if (!customElements.get('product-gallery')) {
  customElements.define(
    'product-gallery',
    class ProductGallery extends HTMLElement {
      connectedCallback() {
        this.slides = Array.from(this.querySelectorAll('.product-gallery__slide[data-media-id]'));
        this.thumbs = Array.from(this.querySelectorAll('button.product-gallery__thumb'));
        this.zoomButton = this.querySelector('.product-gallery__zoom-button');

        this.thumbs.forEach((thumb) => {
          thumb.addEventListener('click', () => this.setActive(thumb.dataset.mediaId));
        });

        if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
          this.unsubscribe = subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
            if (event.data.sectionId !== this.dataset.sectionId) return;
            const mediaId = event.data.variant?.featured_media?.id;
            if (mediaId) this.setActive(String(mediaId));
          });
        }
      }

      disconnectedCallback() {
        this.unsubscribe?.();
      }

      setActive(mediaId) {
        const target = this.slides.find((slide) => slide.dataset.mediaId === mediaId);
        if (!target) return;

        this.slides.forEach((slide) => {
          const active = slide === target;
          slide.classList.toggle('is-active', active);
          slide.hidden = !active;
        });

        this.thumbs.forEach((thumb) => {
          const active = thumb.dataset.mediaId === mediaId;
          thumb.classList.toggle('is-active', active);
          if (active) {
            thumb.setAttribute('aria-current', 'true');
          } else {
            thumb.removeAttribute('aria-current');
          }
        });

        if (this.zoomButton) this.zoomButton.dataset.mediaId = mediaId;
      }
    }
  );
}
