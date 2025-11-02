// ===== СТИЛИ =====
import './scss/styles.scss';

// ===== ДАННЫЕ/ТИПЫ =====
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

// ===== VIEW / EVENTS =====
import { EventEmitter } from './components/base/Events';
import { ModalView } from './components/views/modal/Modal';
import { Header } from './components/views/header/Header';
import { CardCatalog } from './components/views/cards/CardCatalog';
import { ProductModal } from './components/views/modal/ProductModal';
import { BasketView } from './components/views/modal/BasketView';
import { CardBasketItem } from './components/views/cards/CardBasketItem';
import { OrderFormView } from './components/views/forms/OrderFormView';
import { ContactsFormView } from './components/views/forms/ContactsFormView';

// ============================
// СЛОИ И ИНИЦИАЛИЗАЦИЯ
// ============================

// Событийная шина
const events = new EventEmitter();

// Модели
const catalog = new Catalog(events);
const cart    = new Cart(events);
const buyer   = new Buyer(events);

// API (один раз)
const api  = new Api(API_URL);
const shop = new ShopApi(api);

// Базовые View
const modal      = new ModalView(events);
const headerRoot = ensureElement<HTMLElement>('header.header');
const header     = new Header(events, headerRoot);

// Контейнер каталога на главной
const gallery = ensureElement<HTMLElement>('main.gallery');

// ============================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================

// какая сейчас форма в модалке
let currentForm: OrderFormView | ContactsFormView | null = null;

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

// Перерисовать содержимое корзины в модалке
function openBasketModal() {
  const tplBasket = ensureElement<HTMLTemplateElement>('#basket');
  const basketNode = cloneTemplate(tplBasket);

  const basketView = new BasketView(basketNode, events);
  basketView.items    = buildBasketItemNodes();
  basketView.total    = cart.getTotal();
  basketView.disabled = cart.getCount() === 0;

  modal.show(basketView.render({}));
}

// открыть форму №1 (оплата + адрес)
function openOrderForm() {
  const tpl = ensureElement<HTMLTemplateElement>('#order');
  const node = cloneTemplate(tpl);
  const orderForm = new OrderFormView(node, events);

  // если в buyer уже есть адрес — подставим
  const buyerData = buyer.getData();
  if (buyerData.address) {
    orderForm.address = buyerData.address;
  }

  currentForm = orderForm;
  modal.show(orderForm.render({}));
}

// открыть форму №2 (контакты)
function openContactsForm() {
  const tpl = ensureElement<HTMLTemplateElement>('#contacts');
  const node = cloneTemplate(tpl);
  const contactsForm = new ContactsFormView(node, events);

  const buyerData = buyer.getData();
  if (buyerData.email) contactsForm.email = buyerData.email;
  if (buyerData.phone) contactsForm.phone = buyerData.phone;

  currentForm = contactsForm;
  modal.show(contactsForm.render({}));
}

// показать «успех»
function openSuccessModal(total: number) {
  const tpl = ensureElement<HTMLTemplateElement>('#success');
  const node = cloneTemplate(tpl);

  const desc = node.querySelector('.order-success__description');
  if (desc) {
    desc.textContent = `Списано ${total} синапсов`;
  }

  const closeBtn = node.querySelector<HTMLButtonElement>('.order-success__close');
  if(closeBtn) {
    closeBtn.addEventListener('click', () => {
      events.emit('modal:close')
    })
  }

  modal.show(node);
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

// Выбор карточки
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

// Корзина изменилась → обновить счётчик, а если открыта именно корзина — пересобрать её
events.on<{ count: number; total: number }>('cart:changed', ({ count }) => {
  header.counter = count;

  const modalEl = ensureElement<HTMLElement>('#modal-container');
  // перерисовываем корзину только если в модалке именно корзина
  if (modalEl.classList.contains('modal_active')) {
    const content = modalEl.querySelector('.modal__content');
    if (content && content.querySelector('.basket')) {
      openBasketModal();
    }
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

// модалка с формой
events.on('checkout:open', () => {
  openOrderForm();
});

// ============================
// ФОРМЫ → МОДЕЛЬ ПОКУПАТЕЛЯ
// ============================

events.on<{ form: string; field: string; value: string }>(
  'form:change',
  ({ form, field, value }) => {
    // форма заказа (шаг 1)
    if (form === 'order' && (field === 'address' || field === 'payment')) {
      buyer.setField(field as 'address' | 'payment', value as any);
    }

    // форма контактов (шаг 2)
    if (form === 'contacts' && (field === 'email' || field === 'phone')) {
      buyer.setField(field as 'email' | 'phone', value);
    }
  }
);

// отправка форм
events.on<{ form: string }>('form:submit', async ({ form }) => {
  const errors = buyer.validate();

  // ===== ШАГ 1: форма заказа =====
  if (form === 'order') {
    if (errors.payment || errors.address) {
      console.warn('order form invalid', errors);
      return;
    }
    openContactsForm();
    return;
  }

  // ===== ШАГ 2: форма контактов =====
  if (form === 'contacts') {
    if (errors.email || errors.phone) {
      console.warn('contacts form invalid', errors);
      return;
    }

    const buyerData = buyer.getData();
    const items = cart.getItems().map((p) => p.id);
    const total = cart.getTotal();

    try {
      const result = await shop.createOrder({
        ...buyerData,
        items,
        total,
      });

      // очищаем корзину и покупателя
      cart.clear();
      buyer.clear();

      header.counter = cart.getCount();
      openSuccessModal(result.total);
    } catch (e) {
      console.error('Ошибка оформления заказа', e);
    }
  }
});

// реакция на изменение покупателя → включаем/выключаем кнопку
events.on<IBuyer>('buyer:changed', (data) => {
  if (currentForm instanceof OrderFormView) {
    const isValid = Boolean(data.payment && data.address);
    currentForm.valid = isValid;
    currentForm.error = isValid ? '' : 'Выберите способ оплаты и введите адрес';
  }

  if (currentForm instanceof ContactsFormView) {
    const isValid = Boolean(data.email && data.phone);
    currentForm.valid = isValid;
    currentForm.error = isValid ? '' : 'Укажите e-mail и телефон';
  }
});

// ============================
// ИНИЦИАЛИЗАЦИЯ ДАННЫХ
// ============================

// Счётчик в шапке на старте
header.counter = cart.getCount();

// Загрузка с сервера (используем УЖЕ созданный shop)
(async () => {
  try {
    const products = await shop.getCatalog();
    catalog.setItems(products);
  } catch (e) {
    console.error('Ошибка загрузки каталога:', e);
  }
})();
