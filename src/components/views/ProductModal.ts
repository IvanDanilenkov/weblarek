import type { IEvents } from '../base/Events';
import type { IProduct } from '../../types';
import { CardBase } from './CardBase';
import { ensureElement } from '../../utils/utils';

export interface IProductModalData extends IProduct {
  inCart: boolean;
}

export class ProductModal extends CardBase<IProductModalData> {
  private textEl: HTMLElement;
  private btnEl: HTMLButtonElement;

  // служебные поля для эмитов/логики кнопки
  private _id = '';
  private _description = '';
  private _inCart = false;

  constructor(container: HTMLElement, private events: IEvents) {
    super(container);
    this.textEl = ensureElement<HTMLElement>('.card__text', container);
    this.btnEl = ensureElement<HTMLButtonElement>('.card__button', container);

    this.btnEl.addEventListener('click', () => {
      if (!this._id) return;
      if (this._inCart) {
        this.events.emit('product:remove', { id: this._id });
      } else {
        this.events.emit('product:add', { id: this._id });
      }
      this.events.emit('modal:close');
    });
  }

  override render(data: Partial<IProductModalData>): HTMLElement {
    // 1) Отрисовываем базовые поля (title/image/category/price)
    super.render(data);

    // 2) Сохраняем служебные значения для обработчиков
    if (data) {
      if ('id' in data && data.id) this._id = data.id!;
      if ('description' in data) this._description = data.description ?? '';
      if ('inCart' in data) this._inCart = Boolean(data.inCart);
    }

    // 3) Обновляем остальной UI (описание + кнопка)
    this.textEl.textContent = this._description;

    const price: number | null = (data as any)?.price ?? null;
    if (price === null) {
      this.btnEl.textContent = 'Недоступно';
      this.btnEl.disabled = true;
    } else {
      this.btnEl.disabled = false;
      this.btnEl.textContent = this._inCart ? 'Удалить из корзины' : 'В корзину';
    }

    return this.container;
  }
}
