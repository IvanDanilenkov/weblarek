// ===== СТИЛИ =====
import './scss/styles.scss';

// ===== ДАННЫЕ/ТИПЫ =====
import { apiProducts } from './utils/data';
import type { IProduct } from './types';
import type { IProductModalData } from './components/views/ProductModal';

// ===== МОДЕЛИ =====
import { Catalog } from './components/models/Catalog';
import { Cart } from './components/models/Cart';
import { Buyer } from './components/models/Buyer';

// ===== API =====
import { Api } from './components/base/Api';
import { ShopApi } from './components/ApiClient/ShopApi';
import { API_URL } from './utils/constants';

// ===== УТИЛИТЫ =====
import { ensureElement, cloneTemplate } from './utils/utils';

// ===== VIEW / EVENTS =====
import { EventEmitter } from './components/base/Events';
import { ModalView } from './components/views/Modal';
import { Header } from './components/views/Header';
import { CardCatalog } from './components/views/CardCatalog';
import { ProductModal } from './components/views/ProductModal';

// ============================
// ИНИЦИАЛИЗАЦИЯ СЛОЁВ
// ============================

// Событийная шина
const events = new EventEmitter();

// Модели
const catalog = new Catalog(/* при доработке можно передать events */);
const cart = new Cart(/* при доработке можно передать events */);
const buyer = new Buyer(/* при доработке можно передать events */);

// Базовые View
const modal = new ModalView(events);
const headerRoot = ensureElement<HTMLElement>('header.header');
const header = new Header(events, headerRoot);

// Контейнер каталога
const gallery = ensureElement<HTMLElement>('main.gallery');

// ============================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================

// Проверка: товар уже в корзине?
function isInCart(productId: string): boolean {
  const anyCart = cart as any;
  if (typeof anyCart.has === 'function') return anyCart.has(productId);
  if (typeof anyCart.contains === 'function') return anyCart.contains(productId);
  return cart.getItems().some((p: IProduct) => p.id === productId);
}

// Обновить счётчик в шапке
function updateHeaderCounter() {
  // у тебя в Header есть сеттер counter
  header.counter = cart.getCount();
}

// Безопасное добавление в корзину по id
function addToCartById(productId: string) {
  const product = catalog.getItem(productId);
  if (!product) return;

  const anyCart = cart as any;
  if (typeof anyCart.addItem === 'function') anyCart.addItem(product);
  else if (typeof anyCart.add === 'function') anyCart.add(product);

  events.emit('cart:changed');
  updateHeaderCounter();
}

// Безопасное удаление из корзины по id
function removeFromCartById(productId: string) {
  const anyCart = cart as any;

  if (typeof anyCart.removeItemById === 'function') {
    anyCart.removeItemById(productId);
  } else if (typeof anyCart.removeItem === 'function') {
    const product = catalog.getItem(productId);
    if (product) anyCart.removeItem(product);
  } else if (typeof anyCart.remove === 'function') {
    anyCart.remove(productId);
  } else {
    const rest = cart.getItems().filter((p: IProduct) => p.id !== productId);
    if (typeof anyCart.setItems === 'function') anyCart.setItems(rest);
  }

  events.emit('cart:changed');
  updateHeaderCounter();
}

// ============================
// РЕНДЕР КАТАЛОГА
// ============================

events.on('catalog:changed', () => {
  const tpl = ensureElement<HTMLTemplateElement>('#card-catalog');
  const cards = catalog.getItems().map(item => {
    const card = new CardCatalog(cloneTemplate(tpl), events);
    return card.render(item);
  });
  gallery.replaceChildren(...cards);
});

// ============================
// ОТКРЫТИЕ МОДАЛКИ ТОВАРА
// ============================

events.on<{id: string}>('card:select', ({ id }) => {
  const product = catalog.getItem(id);
  if (!product) return;

  const tpl = ensureElement<HTMLTemplateElement>('#card-preview');
  const node = tpl.content.firstElementChild!.cloneNode(true) as HTMLElement;

  const view = new ProductModal(node, events);
  const data = { ...product, inCart: isInCart(product.id) };

  const modalContent = view.render(data);
  events.emit('modal:open', modalContent);
});

// Клики в модалке
events.on<{ id: string }>('product:add', ({ id }) => addToCartById(id));
events.on<{ id: string }>('product:remove', ({ id }) => removeFromCartById(id));

// Иконка корзины в шапке
events.on('basket:open', () => {});

// ============================
// ИНИЦИАЛИЗАЦИЯ ДАННЫХ
// ============================

// 1) Локальные данные из стартера — чтобы сразу увидеть каталог
catalog.setItems(apiProducts.items);
// Если модели ещё не эмитят события — пингуем вручную
events.emit('catalog:changed');
updateHeaderCounter();

// 2) Загрузка с сервера
(async () => {
  const api = new Api(API_URL);
  const shop = new ShopApi(api);

  try {
    const products = await shop.getCatalog(); // GET /api/weblarek/product
    catalog.setItems(products);
    // Если модель не шлёт событие сама — шлём вручную:
    events.emit('catalog:changed');
  } catch (e) {
    console.error('Ошибка загрузки каталога:', e);
  }
})();
