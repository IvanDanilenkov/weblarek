// src/components/ApiClient/ShopApi.ts
import type {
  IApi,
  IProduct,
  IProductsResponse,
  IOrderRequest,
  IOrderResponse,
} from '../../types';

export class ShopApi {
  constructor (private api: IApi) {}

  /**
   * Получить каталог товаров
   * GET /product/
   */
  async getCatalog(): Promise<IProduct[]> {
    const data = await this.api.get<IProductsResponse | IProduct[]>('/product');
    return Array.isArray(data) ? data : (data?.items ?? []);
  }

  /**
   * Отправить заказ
   * POST /order/
   */
  createOrder(payload: IOrderRequest): Promise<IOrderResponse> {
    return this.api.post<IOrderResponse>('/order', payload);
  }
}
