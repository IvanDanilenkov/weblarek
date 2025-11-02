import type { IProduct } from '../../types';
import type { IEvents } from '../base/Events';

export class Cart {
  private items: IProduct[] = [];

  constructor(private events: IEvents) {}

  setItems(items: IProduct[]) {
    this.items = items.slice();
    this.emitChanged();
  }

  getItems() {
    return this.items.slice();
  }

  getCount() {
    return this.items.length;
  }

  getTotal() {
    return this.items.reduce((s, p) => s + (p.price ?? 0), 0);
  }

  addItem(product: IProduct) {
    this.items.push(product);
    this.emitChanged();
  }

  removeItemById(id: string) {
    this.items = this.items.filter((p) => p.id !== id);
    this.emitChanged();
  }

  contains(id: string) {
    return this.items.some((p) => p.id === id);
  }

  clear() {
    this.items = [];
    this.emitChanged();
  }

  private emitChanged() {
    this.events.emit('cart:changed', {
      count: this.getCount(),
      total: this.getTotal(),
    });
  }
}
