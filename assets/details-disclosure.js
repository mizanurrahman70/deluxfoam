class DetailsDisclosure extends HTMLElement {
  constructor() {
    super();
    this.mainDetailsToggle = this.querySelector('details');
    this.content = this.mainDetailsToggle.querySelector('summary').nextElementSibling;

    this.mainDetailsToggle.addEventListener('focusout', this.onFocusOut.bind(this));
    this.mainDetailsToggle.addEventListener('toggle', this.onToggle.bind(this));
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.close();
    });
  }

  onToggle() {
    if (!this.animations) this.animations = this.content.getAnimations();

    if (this.mainDetailsToggle.hasAttribute('open')) {
      this.animations.forEach((animation) => animation.play());
    } else {
      this.animations.forEach((animation) => animation.cancel());
    }
  }

  close() {
    this.mainDetailsToggle.removeAttribute('open');
    this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', false);
  }
}

customElements.define('details-disclosure', DetailsDisclosure);

class HeaderMenu extends DetailsDisclosure {
  static HOVER_CLOSE_DELAY = 250;

  constructor() {
    super();
    this.header = document.querySelector('.header-wrapper');
    this.summary = this.mainDetailsToggle.querySelector('summary');

    // Open on hover for mouse users on desktop; touch and keyboard keep the click behavior
    if (window.matchMedia('(hover: hover)').matches) {
      this.addEventListener('pointerenter', this.onPointerEnter.bind(this));
      this.addEventListener('pointerleave', this.onPointerLeave.bind(this));
      this.summary.addEventListener('click', this.onSummaryClick.bind(this));
    }
  }

  onPointerEnter(event) {
    if (event.pointerType !== 'mouse') return;
    clearTimeout(this.closeTimer);
    if (this.mainDetailsToggle.open) return;
    this.mainDetailsToggle.setAttribute('open', '');
    this.summary.setAttribute('aria-expanded', true);
  }

  onPointerLeave(event) {
    if (event.pointerType !== 'mouse') return;
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => this.close(), HeaderMenu.HOVER_CLOSE_DELAY);
  }

  onSummaryClick(event) {
    // A mouse click on a menu that hover already opened keeps it open
    if (event.detail === 0 || !this.mainDetailsToggle.open || !this.matches(':hover')) return;
    event.preventDefault();
    setTimeout(() => this.summary.setAttribute('aria-expanded', true));
  }

  onToggle() {
    if (!this.header) return;
    this.header.preventHide = this.mainDetailsToggle.open;

    if (document.documentElement.style.getPropertyValue('--header-bottom-position-desktop') !== '') return;
    document.documentElement.style.setProperty(
      '--header-bottom-position-desktop',
      `${Math.floor(this.header.getBoundingClientRect().bottom)}px`
    );
  }
}

customElements.define('header-menu', HeaderMenu);
