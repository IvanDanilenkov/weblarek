import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import type { IEvents } from '../base/Events';

export class BasketView extends Component<{}> {
  private listEl: HTMLElement;
  private priceEl: HTMLElement;
  private submitBtn: HTMLButtonElement;

  constructor(container: HTMLElement, private events: IEvents) {
    super(container);
    this.listEl   = ensureElement<HTMLElement>('.basket__list', container);
    this.priceEl  = ensureElement<HTMLElement>('.basket__price', container);
    this.submitBtn = ensureElement<HTMLButtonElement>('.basket__button', container);

    this.submitBtn.addEventListener('click', () => {
      this.events.emit('checkout:open');
    });
  }

  set items(nodes: HTMLElement[]) {
    this.listEl.replaceChildren(...nodes);
  }

  set total(value: number) {
    this.priceEl.textContent = `${value} синапсов`;
  }

  set disabled(value: boolean) {
    this.submitBtn.disabled = value;
  }
}
