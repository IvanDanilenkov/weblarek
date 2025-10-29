// src/components/models/Catalog.ts
import type { IProduct } from '../../types';
import type { IEvents } from '../base/Events';

export class Catalog {
  private items: IProduct[] = [];
  private selectedId: string | null = null;

  constructor(private events: IEvents) {}

  // Полностью заменить список товаров
  setItems(items: IProduct[]) {
    this.items = items.slice();
    this.events.emit('catalog:changed', { count: this.items.length });
  }

  // Получить копию списка товаров
  getItems(): IProduct[] {
    return this.items.slice();
  }

  // Найти товар по id
  getItem(id: string): IProduct | undefined {
    return this.items.find((i) => i.id === id);
  }

  // Установить/снять выбранный товар
  setSelectedId(id: string | null) {
    this.selectedId = id;
    this.events.emit('catalog:selected', { id });
  }

  // Получить выбранный товар (или null)
  getSelectedItem(): IProduct | null {
    return this.selectedId ? (this.getItem(this.selectedId) ?? null) : null;
  }
}
