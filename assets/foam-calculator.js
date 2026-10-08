if (!customElements.get('foam-calculator')) {
  customElements.define(
    'foam-calculator',
    class FoamCalculator extends HTMLElement {
      connectedCallback() {
        this.currency = this.dataset.currency || '';
        this.seats = 5;

        this.inputs = {};
        this.querySelectorAll('[data-input]').forEach((input) => {
          this.inputs[input.dataset.input] = input;
          input.addEventListener('input', () => this.calculate());
        });

        this.sizeChips = Array.from(this.querySelectorAll('.mattress-calc__chip[data-length]'));
        this.sizeChips.forEach((chip) => chip.addEventListener('click', () => this.applySize(chip)));

        this.thickChips = Array.from(this.querySelectorAll('.foam-calc__thick-chip'));
        this.thickChips.forEach((chip) =>
          chip.addEventListener('click', () => {
            this.inputs.thickIn.value = chip.dataset.thickness;
            this.calculate();
          })
        );

        this.comboChips = Array.from(this.querySelectorAll('.mattress-calc__chip[data-seats]'));
        const activeCombo = this.comboChips.find((chip) => chip.classList.contains('is-active'));
        if (activeCombo) this.seats = Number(activeCombo.dataset.seats);
        this.comboChips.forEach((chip) => chip.addEventListener('click', () => this.applyCombo(chip)));

        this.calculate();
      }

      value(name, fallback = 0) {
        const input = this.inputs[name];
        const number = parseFloat(input ? input.value : NaN);
        return Number.isFinite(number) && number >= 0 ? number : fallback;
      }

      money(amount) {
        return `${this.currency}${Math.round(amount).toLocaleString('en-IN')}`;
      }

      applySize(chip) {
        const length = Number(chip.dataset.length);
        const width = Number(chip.dataset.width);
        this.inputs.lenFt.value = Math.floor(length / 12);
        this.inputs.lenIn.value = length % 12;
        this.inputs.widFt.value = Math.floor(width / 12);
        this.inputs.widIn.value = width % 12;
        this.calculate();
      }

      applyCombo(chip) {
        this.seats = Number(chip.dataset.seats);
        this.comboChips.forEach((item) => {
          item.classList.toggle('is-active', item === chip);
          item.setAttribute('aria-pressed', item === chip);
        });
        this.calculate();
      }

      calculate() {
        const discount = Math.min(this.value('discPct', Number(this.dataset.discount) || 0), 90);

        // Single foam piece
        const lengthIn = this.value('lenFt') * 12 + this.value('lenIn');
        const widthIn = this.value('widFt') * 12 + this.value('widIn');
        const thicknessIn = this.value('thickIn');
        const cft = (lengthIn * widthIn * thicknessIn) / 1728;

        this.setText('[data-output="size"]', `${lengthIn}″ × ${widthIn}″ × ${thicknessIn}″`);
        this.setText('[data-output="cft"]', cft.toFixed(2));

        // Sofa set package: one seat foam + one back foam per seat
        const seatCft = (this.value('seatL') * this.value('seatW') * this.value('seatT')) / 1728;
        const backCft = (this.value('backL') * this.value('backW') * this.value('backT')) / 1728;
        const packageCft = this.seats * (seatCft + backCft);

        this.setText('[data-output="pieces"]', this.seats * 2);
        this.setText('[data-output="split"]', `${this.seats} + ${this.seats}`);
        this.setText('[data-output="package-cft"]', packageCft.toFixed(2));

        this.querySelectorAll('.mattress-calc__card[data-calc]').forEach((card) => {
          const rate = Number(card.dataset.rate) || 0;
          const isPackage = card.dataset.calc === 'package';
          const quantity = isPackage ? packageCft : cft;
          const mrp = quantity * rate;

          card.querySelector('[data-output="mrp"]').textContent = this.money(mrp);
          card.querySelector('[data-output="offer"]').textContent = this.money(mrp * (1 - discount / 100));
          card.querySelector('[data-output="pct"]').textContent = discount;
          card.querySelector('[data-output="formula"]').textContent = `${quantity.toFixed(2)} CFT × ${this.money(rate)}`;
          card.classList.toggle('mattress-calc__card--no-discount', discount === 0);

          if (isPackage) {
            card.querySelector('[data-output="breakdown"]').textContent =
              `${this.seats} seat (${seatCft.toFixed(2)} CFT each) + ${this.seats} back (${backCft.toFixed(2)} CFT each)` +
              ` = ${this.seats * 2} foams`;
          }
        });

        this.sizeChips.forEach((chip) => {
          const active = Number(chip.dataset.length) === lengthIn && Number(chip.dataset.width) === widthIn;
          chip.classList.toggle('is-active', active);
          chip.setAttribute('aria-pressed', active);
        });
        this.thickChips.forEach((chip) => {
          const active = Number(chip.dataset.thickness) === thicknessIn;
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
