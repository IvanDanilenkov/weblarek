import { Component } from '../base/Component';
import { CDN_URL, categoryMap } from '../../utils/constants';

/**
 * Базовый класс карточек. Никакие данные не хранит.
 * В render(data) только обновляет DOM по переданным полям.
 */
export abstract class CardBase<T> extends Component<T> {
  protected titleEl?: HTMLElement;
  protected categoryEl?: HTMLElement;
  protected imageEl?: HTMLImageElement;
  protected priceEl?: HTMLElement;

  constructor(container: HTMLElement) {
    super(container);
    this.titleEl = container.querySelector('.card__title') ?? undefined;
    this.categoryEl = container.querySelector('.card__category') ?? undefined;
    this.imageEl = container.querySelector('.card__image') ?? undefined;
    this.priceEl = container.querySelector('.card__price') ?? undefined;
  }

  // Переопределяем render: НЕ вызываем super.render(data)!
  override render(data?: Partial<T>): HTMLElement {
    if (data) {
      // title
      if ('title' in data && this.titleEl) {
        this.titleEl.textContent = (data as any).title ?? '';
      }
      // image
      if ('image' in data && this.imageEl) {
        const value: string = (data as any).image;
        if (value) {
          const src = this.resolveImage(value);
          this.setImage(this.imageEl, src, (data as any).title ?? '');
        }
      }
      // category
      if ('category' in data && this.categoryEl) {
        const value: string = (data as any).category ?? '';
        this.categoryEl.textContent = value;
        for (const [key, cls] of Object.entries(categoryMap)) {
          this.categoryEl.classList.toggle(cls, key === value);
        }
      }
      // price
      if ('price' in data && this.priceEl) {
        const value: number | null = (data as any).price ?? null;
        this.priceEl.textContent = value == null ? 'Недоступно' : `${value} синапсов`;
      }
    }
    return this.container;
  }

  protected resolveImage(value: string): string {
    if (!value) return '';
    if (/^(https?:|data:)/.test(value)) return value;
    if (value.startsWith('/')) return `${CDN_URL}${value}`;
    return `${CDN_URL}/${value}`;
  }
}

