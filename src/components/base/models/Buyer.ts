import type { IBuyer, TPayment } from "../../../types";

export class Buyer {
  private payment: TPayment = '';
  private email = '';
  private phone = '';
  private address = '';

  setField(field: keyof IBuyer, value: string): void {
    (this as unknown as Record<string, string>)[field] = value;
  }

  getData(): IBuyer {
    return {
      payment: this.payment,
      email: this.email,
      phone: this.phone,
      address: this.address,
    };
  }

  clear(): void {
    this.payment = '';
    this.email = '';
    this.phone = '';
    this.address = '';
  }

  validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    const { payment, email, phone, address } = this.getData();

    if (!payment) errors.payment = 'Не выбран способ оплаты';
    if (!email) errors.email = 'Укажите e-mail';
    if (!phone) errors.phone = 'Укажите телефон';
    if (!address) errors.address = 'Укажите адрес';

    return errors;
  }
}