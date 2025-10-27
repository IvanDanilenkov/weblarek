import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/Events";

export class ModalView {
  private root: HTMLElement;
  private content: HTMLElement;
  private closeBtn: HTMLButtonElement;

  constructor(private events: IEvents) {
    this.root = ensureElement<HTMLElement>('#modal-container', document.body);
    this.content = ensureElement<HTMLElement>('.modal__content', this.root);
    this.closeBtn = ensureElement<HTMLButtonElement>('.modal__close', this.root);
  
    this.closeBtn.addEventListener('click', () => this.close())
    this.root.addEventListener('click', (e) => {
      if (e.target === this.root)
        this.close();
    })

    this.events.on<HTMLElement>('modal:open', (node) => {
      this.setContent(node)
      this.open()
    })
    this.events.on('modal:close', () => this.close())
  }

  setContent(node: HTMLElement) {
    this.content.replaceChildren(node)
  }

  open() {
    this.root.classList.add('modal_opened')
  }

  close() {
    this.root.classList.remove('modal_opened')
    this.content.replaceChildren()
  }
}