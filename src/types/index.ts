export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export type TPayment = 'card' | 'cash' | '';

export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

export interface IBuyer {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
}

export interface IProductsResponse {
  items: IProduct[];
}

// Заказ. Используем уже существующие типы покупателя и айди товаров.
export type ProductID = string;

export interface IOrderRequest extends IBuyer {
  items: ProductID[];   // список ID товаров из корзины
  total: number;        // итоговая сумма (считаем на клиенте)
}

export interface IOrderResponse {
  id: string;           // идентификатор созданного заказа
  total: number;        // сумма, которую подтвердил сервер
}