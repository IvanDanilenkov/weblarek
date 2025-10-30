import type {
  IApi,
  IProduct,
  IProductsResponse,
  IOrderRequest,
  IOrderResponse,
} from '../../types';
import { CDN_URL } from '../../utils/constants';

export class ShopApi {
  constructor (private api: IApi, private cdn: string = CDN_URL) {}

  /**
   * Получить каталог товаров
   * GET /product/
   */
  async getCatalog(): Promise<IProduct[]> {
    const data = await this.api.get<IProductsResponse | IProduct[]>('/product');

    const items =  Array.isArray(data) ? data : (data?.items ?? []);

    return items.map((item) => {
      const raw = item.image ?? '';
      const withPng = raw.replace(/\.svg$/i, '.png');
      const isAbsolute = /^(https?:)?\/\//i.test(withPng);

      return {
        ...item,
        image: isAbsolute
          ? withPng
          : `${this.cdn.replace(/\/$/, '')}/${withPng.replace(/^\//, '')}`,
      };
    });
  }  

  /**
   * Отправить заказ
   * POST /order/
   */
  createOrder(payload: IOrderRequest): Promise<IOrderResponse> {
    return this.api.post<IOrderResponse>('/order', payload);
  }
}
