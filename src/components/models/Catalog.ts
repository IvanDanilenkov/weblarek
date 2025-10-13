import type { IProduct } from "../../types";

export class Catalog {
  private items: IProduct[] = [];
  private selectedId: string | null = null;

  setItems(items: IProduct[]): void {
    this.items = Array.isArray(items) ? items.slice() : [];
  }

  getItems(): IProduct[] {
    return this.items.slice()
  }

  getItem(id: string): IProduct | undefined {
    return this.items.find((p) => p.id === id)
  }

  setSelectedId(id: string | null): void {
    this.selectedId = id;
  }

  getSelectedItem(): IProduct | null {
    if (!this.selectedId) return null;
    return this.getItem(this.selectedId) ?? null;
  }
}