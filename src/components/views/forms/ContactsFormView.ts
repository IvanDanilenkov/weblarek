import { FormView } from "./Form";
import { IEvents } from "../../base/Events";
import { ensureElement } from "../../../utils/utils";

export class ContactsFormView extends FormView<{}> {
  private emailInput: HTMLInputElement;
  private phoneInput: HTMLInputElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', container);
    this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', container);
  }

  set email(value: string) {
    this.emailInput.value = value;
  }

  set phone(value: string) {
    this.phoneInput.value = value;
  }
}
