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
import { BasketView } from './components/views/BasketView'; 
import { CardBasketItem } from './components/views/CardBasketItem';

// ============================
// СЛОИ И ИНИЦИАЛИЗАЦИЯ
// ============================

// Событийная шина
const events = new EventEmitter();

// Включи «лампочку» всех событий (удобно для обучения)
// Можно закомментировать после отладки
events.onAll(({ eventName, data }) => {
  // eslint-disable-next-line no-console
  console.log('[EVENT]', eventName, data);
});

// Модели
const catalog = new Catalog(events);
const cart    = new Cart(events);
const buyer   = new Buyer();

// Базовые View
const modal      = new ModalView(events);
const headerRoot = ensureElement<HTMLElement>('header.header');
const header     = new Header(events, headerRoot);

// Контейнер каталога на главной
const gallery = ensureElement<HTMLElement>('main.gallery');

// ============================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================

// Товар в корзине?
const isInCart = (productId: string) => cart.contains(productId);

// Построить список DOM-узлов для корзины
function buildBasketItemNodes(): HTMLElement[] {
  const tplItem = ensureElement<HTMLTemplateElement>('#card-basket');

  return cart.getItems().map((item, index) => {
    const nodeItem = cloneTemplate(tplItem);
    const viewItem = new CardBasketItem(nodeItem, events);
    return viewItem.render({ ...item, index: index + 1 });
  });
}

// Перерисовать содержимое корзины в модалке (если открыли корзину)
function openBasketModal() {
  const tplBasket = ensureElement<HTMLTemplateElement>('#basket');
  const basketNode = cloneTemplate(tplBasket);

  const basketView = new BasketView(basketNode, events);
  basketView.items    = buildBasketItemNodes();
  basketView.total    = cart.getTotal();
  basketView.disabled = cart.getCount() === 0;

  modal.show(basketView.render({}));
}

// ============================
// ПРЕЗЕНТЕР: ОБРАБОТЧИКИ СОБЫТИЙ
// ============================

// --- МОДЕЛИ ---

// Каталог изменился → перерисовать список карточек на главной
events.on('catalog:changed', () => {
  const tpl = ensureElement<HTMLTemplateElement>('#card-catalog');
  const cards = catalog.getItems().map((item) => {
    const node = cloneTemplate(tpl);
    const card = new CardCatalog(node, events);
    return card.render(item);
  });
  gallery.replaceChildren(...cards);
});

// Выбор карточки (модель хранит selectedId)
events.on<{ id: string | null }>('catalog:selected', ({ id }) => {
  if (!id) return;
  const product = catalog.getItem(id);
  if (!product) return;

  // Собираем модальное представление товара
  const tpl = ensureElement<HTMLTemplateElement>('#card-preview');
  const node = cloneTemplate(tpl);

  const view = new ProductModal(node, events);
  const data: IProductModalData = {
    ...product,
    inCart: isInCart(product.id),
  };

  modal.show(view.render(data));
});

// Корзина изменилась → обновить счётчик, а если корзина открыта — пересобрать её
events.on<{ count: number; total: number }>('cart:changed', ({ count }) => {
  header.counter = count;

  // Если модалка сейчас показывает корзину — можно просто заново открыть её
  // (в учебном проекте это достаточно; при желании можно сделать мягкий апдейт)
  const modalEl = ensureElement<HTMLElement>('#modal-container');
  if (modalEl.classList.contains('modal_active')) {
    // Переоткроем, если внутри была корзина (простая эвристика)
    // В учебном проекте достаточно всегда переоткрывать при изменениях корзины
    openBasketModal();
  }
});

// --- VIEW ---

// Клик по карточке каталога → просто говорим модели, что выбрали товар
events.on<{ id: string }>('card:select', ({ id }) => {
  catalog.setSelectedId(id);
});

// Кнопка «В корзину» / «Удалить из корзины» в модалке товара
events.on<{ id: string }>('product:add', ({ id }) => {
  const p = catalog.getItem(id);
  if (p) cart.addItem(p);       // Cart сам эмитит 'cart:changed'
});
events.on<{ id: string }>('product:remove', ({ id }) => {
  cart.removeItemById(id);      // Cart сам эмитит 'cart:changed'
});

// Открытие корзины из шапки
events.on('basket:open', () => {
  openBasketModal();
});

// (Опционально) Начало оформления — откроется форма, когда её реализуем
events.on('checkout:open', () => {
  // Тут позже подключим OrderForm (шаг с оплатой) → ContactsForm
  // Пока оставим заглушку или консоль
  console.log('checkout:open — TODO: формы заказа');
});

// ============================
// ИНИЦИАЛИЗАЦИЯ ДАННЫХ
// ============================

// Счётчик в шапке на старте
header.counter = cart.getCount();

// 1) Быстрый старт на локальных данных, чтобы сразу увидеть карточки
catalog.setItems(apiProducts.items);

// 2) Загрузка с сервера — заменит локальные данные и триггернет 'catalog:changed'
(async () => {
  const api  = new Api(API_URL);
  const shop = new ShopApi(api);

  try {
    const products = await shop.getCatalog(); // GET /api/weblarek/product
    catalog.setItems(products);
  } catch (e) {
    console.error('Ошибка загрузки каталога:', e);
  }
})();
