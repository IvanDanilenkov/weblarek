import type { IProduct } from "../../types";

export class Cart {
  private items: IProduct[] = [];

  getItems(): IProduct[] {
    return this.items.slice();
  }

  addItem(product: IProduct): void {
    this.items.push(product);
  }

  removeItem(productId: string): void {
    this.items = this.items.filter((p) => p.id !== productId);
  }

  clear(): void {
    this.items = [];
  }

  getTotal(): number {
    return this.items.reduce((sum, p) => sum + (p.price ?? 0), 0);
  }

  getCount(): number {
    return this.items.length;
  }

  hasItem(productId: string): boolean {
    return this.items.some((p) => p.id === productId);
  }
}