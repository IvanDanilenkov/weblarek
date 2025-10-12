import './scss/styles.scss';
import { apiProducts } from './utils/data';
import { Catalog } from './components/base/models/Catalog';
import { Cart } from './components/base/models/Cart';
import { Buyer } from './components/base/models/Buyer';


// Catalog
const catalog = new Catalog();
catalog.setItems(apiProducts.items);
console.log('Каталог / все товары:', catalog.getItems());
const firstId = apiProducts.items[0]?.id ?? null;
catalog.setSelectedId(firstId);
console.log('Каталог / выбранный товар:', catalog.getSelectedItem());

// Cart
const cart = new Cart();
if (firstId) {
  const first = catalog.getItem(firstId)!;
  cart.addItem(first);
  cart.addItem(first); // добавим второй раз для наглядности
}
console.log('Корзина / список:', cart.getItems());
console.log('Корзина / сумма:', cart.getTotal());
console.log('Корзина / количество:', cart.getCount());

// Buyer
const buyer = new Buyer();
buyer.setField('payment', 'card');
buyer.setField('email', 'ivan@example.com');
buyer.setField('phone', '+1-555-0123');
buyer.setField('address', 'Toronto, ON');
console.log('Покупатель / данные:', buyer.getData());
console.log('Покупатель / ошибки валидации:', buyer.validate()); // должен быть {}
