// ===== СТИЛИ =====
import './scss/styles.scss';

// ===== ТИПЫ =====
import type { IProductModalData } from './components/views/modal/ProductModal';
import type { IBuyer } from './types';

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

// ===== EVENTS ENUM =====
import { EVENTS } from './utils/events';

// ===== VIEW =====
import { EventEmitter } from './components/base/Events';
import { ModalView } from './components/views/modal/Modal';
import { Header } from './components/views/header/Header';
import { CardCatalog } from './components/views/cards/CardCatalog';
import { ProductModal } from './components/views/modal/ProductModal';
import { BasketView } from './components/views/modal/BasketView';
import { CardBasketItem } from './components/views/cards/CardBasketItem';
import { OrderFormView } from './components/views/forms/OrderFormView';
import { ContactsFormView } from './components/views/forms/ContactsFormView';
import { SuccessMessage } from './components/views/modal/SuccessMessage';

// ============================
// 1. СОЗДАЁМ СЛОИ
// ============================

// брокер событий
const events = new EventEmitter();

// модели
const catalog = new Catalog(events);
const cart    = new Cart(events);
const buyer   = new Buyer(events);

// api
const api  = new Api(API_URL);
const shop = new ShopApi(api);

// базовые view
const modal      = new ModalView(events);
const headerRoot = ensureElement<HTMLElement>('header.header');
const header     = new Header(events, headerRoot);

// контейнер каталога
const gallery = ensureElement<HTMLElement>('main.gallery');

// ============================
// 2. КЕШИРУЕМ ТЕМПЛЕЙТЫ
// ============================
const tplCardCatalog  = ensureElement<HTMLTemplateElement>('#card-catalog');
const tplCardPreview  = ensureElement<HTMLTemplateElement>('#card-preview');
const tplBasket       = ensureElement<HTMLTemplateElement>('#basket');
const tplBasketItem   = ensureElement<HTMLTemplateElement>('#card-basket');
const tplOrder        = ensureElement<HTMLTemplateElement>('#order');
const tplContacts     = ensureElement<HTMLTemplateElement>('#contacts');
const tplSuccess      = ensureElement<HTMLTemplateElement>('#success');

// ============================
// 3. СОЗДАЁМ VIEW ОДИН РАЗ
// ============================

// корзина (вид)
const basketView = new BasketView(cloneTemplate(tplBasket), events);

// формы (виды)
const orderFormView    = new OrderFormView(cloneTemplate(tplOrder), events);
const contactsFormView = new ContactsFormView(cloneTemplate(tplContacts), events);

// попап "успех"
const successView = new SuccessMessage(cloneTemplate(tplSuccess), events);

// какая форма сейчас открыта
let currentForm: OrderFormView | ContactsFormView | null = null;

// ============================
// 4. ВСПОМОГАТЕЛЬНОЕ
// ============================

// товар в корзине?
const isInCart = (productId: string) => cart.contains(productId);

// собрать элементы корзины
function buildBasketItemNodes(): HTMLElement[] {
  return cart.getItems().map((item, index) => {
    const node = cloneTemplate(tplBasketItem);
    const view = new CardBasketItem(node, events);
    return view.render({ ...item, index: index + 1 });
  });
}

// открыть корзину
function openBasketModal() {
  basketView.items    = buildBasketItemNodes();
  basketView.total    = cart.getTotal();
  basketView.disabled = cart.getCount() === 0;

  modal.show(basketView.render({}));
}

// открыть форму №1
function openOrderForm() {
  // подставим сохранённые данные
  const data = buyer.getData();
  if (data.address) {
    orderFormView.address = data.address;
  }
  if (data.payment) {
    orderFormView.payment = data.payment;
  }

  currentForm = orderFormView;
  modal.show(orderFormView.render({}));
}

// открыть форму №2
function openContactsForm() {
  const data = buyer.getData();
  if (data.email) {
    contactsFormView.email = data.email;
  }
  if (data.phone) {
    contactsFormView.phone = data.phone;
  }

  currentForm = contactsFormView;
  modal.show(contactsFormView.render({}));
}

// открыть успех
function openSuccessModal(total: number) {
  successView.render({ total });
  modal.show(successView.render({ total }));
}

// ============================
// 5. ПРЕЗЕНТЕР
// ============================

// --- МОДЕЛИ ---

// каталог изменился → перерисовать список
events.on(EVENTS.CATALOG_CHANGED, () => {
  const cards = catalog.getItems().map((item) => {
    const node = cloneTemplate(tplCardCatalog);
    const card = new CardCatalog(node, events);
    return card.render(item);
  });
  gallery.replaceChildren(...cards);
});

// выбран товар
events.on<{ id: string | null }>(EVENTS.CATALOG_SELECTED, ({ id }) => {
  if (!id) return;
  const product = catalog.getItem(id);
  if (!product) return;

  const node = cloneTemplate(tplCardPreview);
  const view = new ProductModal(node, events);

  const data: IProductModalData = {
    ...product,
    inCart: isInCart(product.id),
  };

  modal.show(view.render(data));
});

// корзина изменилась
events.on<{ count: number; total: number }>(EVENTS.CART_CHANGED, ({ count }) => {
  header.counter = count;

  // если открыта корзина — переобновим
  const modalEl = ensureElement<HTMLElement>('#modal-container');
  if (modalEl.classList.contains('modal_active')) {
    const content = modalEl.querySelector('.modal__content');
    if (content && content.querySelector('.basket')) {
      openBasketModal();
    }
  }
});

// --- VIEW ---

// клик по карточке
events.on<{ id: string }>(EVENTS.CARD_SELECT, ({ id }) => {
  catalog.setSelectedId(id);
});

// «в корзину»
events.on<{ id: string }>(EVENTS.PRODUCT_ADD, ({ id }) => {
  const product = catalog.getItem(id);
  if (product) {
    cart.addItem(product);
  }
});

// «удалить из корзины»
events.on<{ id: string }>(EVENTS.PRODUCT_REMOVE, ({ id }) => {
  cart.removeItemById(id);
});

// открыть корзину
events.on(EVENTS.BASKET_OPEN, () => {
  openBasketModal();
});

// открыть форму заказа
events.on(EVENTS.CHECKOUT_OPEN, () => {
  openOrderForm();
});

// --- ФОРМЫ ---

// изменение полей
events.on<{ form: string; field: string; value: string }>(
  EVENTS.FORM_CHANGE,
  ({ form, field, value }) => {
    if (form === 'order' && (field === 'address' || field === 'payment')) {
      buyer.setField(field as 'address' | 'payment', value as any);
    }
    if (form === 'contacts' && (field === 'email' || field === 'phone')) {
      buyer.setField(field as 'email' | 'phone', value);
    }
  }
);

// отправка форм
events.on<{ form: string }>(EVENTS.FORM_SUBMIT, async ({ form }) => {
  const errors = buyer.validate();

  // шаг 1
  if (form === 'order') {
    if (errors.payment || errors.address) {
      return;
    }
    openContactsForm();
    return;
  }

  // шаг 2
  if (form === 'contacts') {
    if (errors.email || errors.phone) {
      return;
    }

    const buyerData = buyer.getData();
    const items = cart.getItems().map((p) => p.id);
    const total = cart.getTotal();

    const result = await shop.createOrder({
      ...buyerData,
      items,
      total,
    });

    cart.clear();
    buyer.clear();
    header.counter = cart.getCount();
    openSuccessModal(result.total);
  }
});

// изменения покупателя → валидируем текущую форму
events.on<IBuyer>(EVENTS.BUYER_CHANGED, (data) => {
  if (currentForm instanceof OrderFormView) {
    const valid = Boolean(data.payment && data.address);
    currentForm.valid = valid;
    currentForm.error = valid ? '' : 'Выберите способ оплаты и введите адрес';
  }
  if (currentForm instanceof ContactsFormView) {
    const valid = Boolean(data.email && data.phone);
    currentForm.valid = valid;
    currentForm.error = valid ? '' : 'Укажите e-mail и телефон';
  }
});

// ============================
// 6. ИНИЦИАЛИЗАЦИЯ
// ============================

// счётчик
header.counter = cart.getCount();

// загрузка каталога
(async () => {
  try {
    const products = await shop.getCatalog();
    catalog.setItems(products);
  } catch (e) {
    console.error('Ошибка загрузки каталога:', e);
  }
})();
