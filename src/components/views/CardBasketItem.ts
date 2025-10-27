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
    this.indexEl = ensureElement<HTMLElement>('.basket__item-index', container);
    this.deleteBtn = ensureElement<HTMLButtonElement>('.basket__item-delete', container);

    this.deleteBtn.addEventListener('click', () => {
      if (this._id) this.events.emit('product:remove', { id: this._id });
    });
  }

  override render(data: Partial<IProduct> & { index: number }): HTMLElement {
    // базовые поля (title/image/category/price)
    super.render(data);

    // служебные + специфический UI
    if (data && 'id' in data && data.id) this._id = data.id!;
    this.indexEl.textContent = String(data.index);

    return this.container;
  }
}
