// src/components/views/Form.ts
import { Component } from '../../base/Component';
import { ensureElement } from '../../../utils/utils';
import type { IEvents } from '../../base/Events';
import { EVENTS } from '../../../utils/events';

export abstract class FormView<T> extends Component<T> {
  protected form: HTMLFormElement;
  protected submitBtn: HTMLButtonElement;
  protected errorsEl: HTMLElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this.form      = container as HTMLFormElement;
    this.submitBtn = ensureElement<HTMLButtonElement>('.button[type="submit"], .order__button, button[type="submit"]', container);
    this.errorsEl  = ensureElement<HTMLElement>('.form__errors', container);

    this.form.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      if (!target.name) return;

      this.events.emit(EVENTS.FORM_CHANGE, {
        form: this.form.name,
        field: target.name,
        value: target.value,
      });
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.events.emit(EVENTS.FORM_SUBMIT, {
        form: this.form.name,
      });
    });
  }

// включить/выключить кнопку
  set valid(value: boolean) {
    this.submitBtn.disabled = !value;
  }

// показать текст ошибки
  set error(message: string) {
    this.errorsEl.textContent = message;
  }
}