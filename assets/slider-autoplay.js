if (!customElements.get('slider-autoplay')) {
  customElements.define(
    'slider-autoplay',
    class SliderAutoplay extends HTMLElement {
      connectedCallback() {
        this.slider = this.querySelector('[id^="Slider-"]');
        if (!this.slider || !parseInt(this.dataset.speed, 10)) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        this.speed = Math.max(parseInt(this.dataset.speed, 10) || 3000, 1500);
        this.paused = false;
        this.visible = false;

        const pause = () => (this.paused = true);
        const resume = () => (this.paused = false);
        this.addEventListener('mouseenter', pause);
        this.addEventListener('mouseleave', resume);
        this.addEventListener('focusin', pause);
        this.addEventListener('focusout', resume);
        this.slider.addEventListener('touchstart', pause, { passive: true });
        this.slider.addEventListener('touchend', () => setTimeout(resume, this.speed), { passive: true });

        this.observer = new IntersectionObserver((entries) => {
          this.visible = entries[0].isIntersecting;
        });
        this.observer.observe(this);

        this.timer = setInterval(() => this.advance(), this.speed);
      }

      disconnectedCallback() {
        clearInterval(this.timer);
        this.observer?.disconnect();
      }

      advance() {
        if (this.paused || !this.visible || document.hidden) return;

        const items = Array.from(this.slider.children).filter((item) => item.clientWidth > 0);
        if (items.length < 2) return;

        const step = items[1].offsetLeft - items[0].offsetLeft;
        const atEnd = this.slider.scrollLeft + this.slider.clientWidth >= this.slider.scrollWidth - 2;

        this.slider.scrollTo({ left: atEnd ? 0 : this.slider.scrollLeft + step, behavior: 'smooth' });
      }
    }
  );
}
