import { FormView } from "./Form";
import { IEvents } from "../../base/Events";
import { ensureElement } from "../../../utils/utils";

export class OrderFormView extends FormView<{}> {
  private addressInput: HTMLInputElement;
  private payCardBtn: HTMLButtonElement;
  private payCashBtn: HTMLButtonElement;
  private activeClass = 'button_alt-active';

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', container);
    this.payCardBtn   = ensureElement<HTMLButtonElement>('button[name="card"]', container);
    this.payCashBtn   = ensureElement<HTMLButtonElement>('button[name="cash"]', container);

    // клики по кнопкам оплаты
    this.payCardBtn.addEventListener('click', () => this.setPayment('card'));
    this.payCashBtn.addEventListener('click', () => this.setPayment('cash'));
  }

  private setPayment(method: 'card' | 'cash') {
    // выделяем выбранную кнопку
    this.payCardBtn.classList.toggle(this.activeClass, method === 'card');
    this.payCashBtn.classList.toggle(this.activeClass, method === 'cash');

    this.events.emit('order:payment', { payment: method });

    this.events.emit('form:change', {
      form: 'order',
      field: 'payment',
      value: method,
    });
  }

  set address(value: string) {
    this.addressInput.value = value;
  }
}
