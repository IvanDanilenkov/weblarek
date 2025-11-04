export enum EVENTS {
  // от моделей
  CATALOG_CHANGED = 'catalog:changed',
  CATALOG_SELECTED = 'catalog:selected',
  CART_CHANGED = 'cart:changed',
  BUYER_CHANGED = 'buyer:changed',

  // от представлений
  CARD_SELECT = 'card:select',
  PRODUCT_ADD = 'product:add',
  PRODUCT_REMOVE = 'product:remove',
  BASKET_OPEN = 'basket:open',
  CHECKOUT_OPEN = 'checkout:open',
  FORM_CHANGE = 'form:change',
  FORM_SUBMIT = 'form:submit',

  // модалка
  MODAL_OPEN = 'modal:open',
  MODAL_CLOSE = 'modal:close',
}