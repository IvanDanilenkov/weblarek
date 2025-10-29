import type { IEvents } from '../base/Events';
import type { IProduct } from '../../types';
import { CardBase } from './CardBase';
import { ensureElement } from '../../utils/utils';

export class CardBasketItem extends CardBase<IProduct> {
  private indexEl: HTMLElement;
  private deleteBtn: HTMLButtonElement;
  private _id = '';

  constructor(container: HTMLElement, private events: IEvents) {
    super(container);
    this.indexEl  = ensureElement<HTMLElement>('.basket__item-index', container);
    this.deleteBtn = ensureElement<HTMLButtonElement>('.basket__item-delete', container);

    this.deleteBtn.addEventListener('click', () => {
      if (this._id) this.events.emit('product:remove', { id: this._id });
    });
  }

  // не храним данные — только заполняем DOM + кешируем id для события
  override render(data: Partial<IProduct> & { index: number }): HTMLElement {
    super.render(data);                 // title / price заполнятся через CardBase
    if (data.id) this._id = data.id;    // чтобы знать, что удалять
    this.indexEl.textContent = String(data.index);
    return this.container;
  }
}
