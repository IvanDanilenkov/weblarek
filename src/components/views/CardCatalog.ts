import { CardBase } from './CardBase';
import type { IEvents } from '../base/Events';
import type { IProduct } from '../../types';

export class CardCatalog extends CardBase<IProduct> {
  private _id = '';

  constructor(container: HTMLElement, private events: IEvents) {
    super(container);
    this.container.addEventListener('click', () => {
      if (this._id) this.events.emit('card:select', { id: this._id });
    });
  }

  override render(data: Partial<IProduct>): HTMLElement {
    // сначала отрисовываем UI
    super.render(data);
    // затем берём служебное значение для эмита
    if (data && 'id' in data && data.id) this._id = data.id!;
    return this.container;
  }
}

