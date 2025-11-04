import { Component } from "../../base/Component";
import { IEvents } from "../../base/Events";
import { EVENTS } from "../../../utils/events";

interface ISuccessData {
  total: number
}

export class SuccessMessage extends Component<ISuccessData> {
  private descEl: HTMLElement;
  private btnEl: HTMLBRElement;

  constructor(container: HTMLElement, private events: IEvents) {
    super(container);

    this.descEl  = container.querySelector('.order-success__description')!;
    this.btnEl   = container.querySelector('.order-success__close')!;

    this.btnEl.addEventListener('click', () => {
      this.events.emit(EVENTS.MODAL_CLOSE);
    })
  }

  set total(value: number) {
    this.descEl.textContent = `Списано ${value} синапсов`;
  }
}