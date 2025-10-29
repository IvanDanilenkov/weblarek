import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import type { IEvents } from '../base/Events';

export class ModalView extends Component<{}> {
  private containerEl: HTMLElement;    // .modal
  private contentEl: HTMLElement;      // .modal__content
  private closeBtn: HTMLButtonElement; // .modal__close
  private activeClass = 'modal_active';

  constructor(private events: IEvents) {
    // корневой контейнер — сам .modal
    const containerEl = ensureElement<HTMLElement>('#modal-container');
    super(containerEl);

    this.containerEl = containerEl;
    this.contentEl   = ensureElement<HTMLElement>('.modal__content', this.containerEl);
    this.closeBtn    = ensureElement<HTMLButtonElement>('.modal__close', this.containerEl);

    // закрытие по крестику
    this.closeBtn.addEventListener('click', () => this.hide());

    // закрытие по клику вне контента
    this.containerEl.addEventListener('mousedown', (e) => {
      if (e.target === this.containerEl) this.hide();
    });

    // слушаем события
    this.events.on<HTMLElement>('modal:open', (node) => {
      if (!node) return;
      this.show(node);
    });
    this.events.on('modal:close', () => this.hide());
  }

  show(node: HTMLElement) {
    // вставляем контент
    this.contentEl.replaceChildren(node);
    // показываем модалку
    this.containerEl.classList.add(this.activeClass);
    // блокируем скролл страницы (опционально)
    document.body.style.overflow = 'hidden';
  }

  hide() {
    this.containerEl.classList.remove(this.activeClass);
    this.contentEl.replaceChildren();
    document.body.style.overflow = '';
  }
}
