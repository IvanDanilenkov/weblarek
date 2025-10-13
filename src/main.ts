import './scss/styles.scss';

import { apiProducts } from './utils/data';
import { Catalog } from './components/base/models/Catalog';
import { Cart } from './components/base/models/Cart';
import { Buyer } from './components/base/models/Buyer';

import { Api } from './components/base/Api';
import { ShopApi } from './components/ApiClient/ShopApi';
import { API_URL } from './utils/constants';

// === ИНИЦИАЛИЗАЦИЯ МОДЕЛЕЙ ===
const catalog = new Catalog();
const cart = new Cart();
const buyer = new Buyer();

// === ЛОКАЛЬНАЯ ПРОВЕРКА МЕТОДОВ (данные из стартера) ===
catalog.setItems(apiProducts.items);
console.log('Каталог (локальные данные):', catalog.getItems());

const firstId = apiProducts.items[0]?.id ?? null;
catalog.setSelectedId(firstId);
console.log('Каталог / выбранный товар (локальные):', catalog.getSelectedItem());

if (firstId) {
  const first = catalog.getItem(firstId)!;
  cart.addItem(first);
  cart.addItem(first); // наглядно добавим 2 раза
}
console.log('Корзина / список:', cart.getItems());
console.log('Корзина / сумма:', cart.getTotal());
console.log('Корзина / количество:', cart.getCount());

buyer.setField('payment', 'card');
buyer.setField('email', 'ivan@example.com');
buyer.setField('phone', '+1-555-0123');
buyer.setField('address', 'Toronto, ON');
console.log('Покупатель / данные:', buyer.getData());
console.log('Покупатель / ошибки валидации:', buyer.validate());

// === ЗАГРУЗКА С СЕРВЕРА В ТУ ЖЕ МОДЕЛЬ КАТАЛОГА ===
(async () => {
  console.log('API base URL =', API_URL);

  const api = new Api(API_URL);        // базовый префикс: .../api/weblarek
  const shop = new ShopApi(api);       // внутри должен дергать '/product' и '/order'

  try {
    const products = await shop.getCatalog(); // GET /api/weblarek/product
    catalog.setItems(products);

    console.log('Каталог (с сервера):', catalog.getItems());
    console.log('Первый товар (с сервера):', catalog.getItems()[0]);
  } catch (e) {
    console.error('Ошибка загрузки каталога:', e);
  }
})();

