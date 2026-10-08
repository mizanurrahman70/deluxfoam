if (!customElements.get('mattress-calculator')) {
  customElements.define(
    'mattress-calculator',
    class MattressCalculator extends HTMLElement {
      connectedCallback() {
        this.currency = this.dataset.currency || '';
        this.inputs = {};
        this.querySelectorAll('[data-input]').forEach((input) => {
          this.inputs[input.dataset.input] = input;
          input.addEventListener('input', () => this.calculate());
        });
        this.chips = Array.from(this.querySelectorAll('.mattress-calc__chip'));
        this.chips.forEach((chip) => chip.addEventListener('click', () => this.applyPreset(chip)));
        this.calculate();
      }

      value(name, fallback = 0) {
        const input = this.inputs[name];
        const number = parseFloat(input ? input.value : NaN);
        return Number.isFinite(number) && number >= 0 ? number : fallback;
      }

      format(amount) {
        return `${this.currency}${Math.round(amount).toLocaleString('en-IN')}`;
      }

      applyPreset(chip) {
        const length = Number(chip.dataset.length);
        const width = Number(chip.dataset.width);
        this.inputs.lenFt.value = Math.floor(length / 12);
        this.inputs.lenIn.value = length % 12;
        this.inputs.widFt.value = Math.floor(width / 12);
        this.inputs.widIn.value = width % 12;
        this.calculate();
      }

      calculate() {
        const lengthIn = this.value('lenFt') * 12 + this.value('lenIn');
        const widthIn = this.value('widFt') * 12 + this.value('widIn');
        const thicknessIn = this.value('thickIn');
        const discount = Math.min(this.value('discPct', Number(this.dataset.discount) || 0), 90);

        const sft = (lengthIn * widthIn) / 144;
        const cft = sft * (thicknessIn / 12);

        this.setText('[data-output="size"]', `${lengthIn}″ × ${widthIn}″`);
        this.setText('[data-output="sft"]', sft.toFixed(2));
        this.setText('[data-output="cft"]', cft.toFixed(2));

        this.querySelectorAll('.mattress-calc__card').forEach((card) => {
          const rate = Number(card.dataset.rate) || 0;
          const quantity = card.dataset.unit === 'CFT' ? cft : sft;
          const mrp = quantity * rate;
          const offer = mrp * (1 - discount / 100);

          card.querySelector('[data-output="mrp"]').textContent = this.format(mrp);
          card.querySelector('[data-output="offer"]').textContent = this.format(offer);
          card.querySelector('[data-output="pct"]').textContent = discount;
          card.querySelector('[data-output="formula"]').textContent =
            `${quantity.toFixed(2)} ${card.dataset.unit} × ${this.format(rate)}`;
          card.classList.toggle('mattress-calc__card--no-discount', discount === 0);
        });

        this.chips.forEach((chip) => {
          const active = Number(chip.dataset.length) === lengthIn && Number(chip.dataset.width) === widthIn;
          chip.classList.toggle('is-active', active);
          chip.setAttribute('aria-pressed', active);
        });
      }

      setText(selector, text) {
        const element = this.querySelector(selector);
        if (element) element.textContent = text;
      }
    }
  );
}
