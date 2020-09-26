import {IInvoiceFormData, IInvoiceItemFormData} from './invoice-form-data';
import {DateUtility, Invoice, InvoiceData, InvoiceFactory, Receiver, ReceiverData, ReceiverFactory} from 'jovisco-domain';

export class InvoiceFormDataMapper {

  private formData: IInvoiceFormData = {} as IInvoiceFormData;
  private readonly currencyOptions: any = {};
  private readonly dateFormatOptions: any = {};
  private offset = 0;
  private dateTimeFormat: Intl.DateTimeFormat;
  private numberFormat: Intl.NumberFormat;
  private currencyFormat: Intl.NumberFormat;
  private invoice: Invoice = {} as Invoice;
  private receiver: Receiver = {} as Receiver;

  constructor(invoice: InvoiceData,
              receiver: ReceiverData,
              private locale: string = 'de-DE',
              private currency: string = 'EUR') {

    this.invoice = InvoiceFactory.fromData(invoice);
    this.receiver = ReceiverFactory.fromData(receiver);

    this.currencyOptions = {
      style: 'currency',
      currency: this.currency,
      currencyDisplay: 'symbol'
    };

    this.dateFormatOptions = {
      // timeZoneName: 'Europa/Berlin'
      timeZoneName: 'Europe/Berlin'
    };

    try {
      this.dateTimeFormat = new Intl.DateTimeFormat(this.locale, this.dateFormatOptions);
    } catch (e) {
      console.log(`WARNING: timeZoneName: ${this.dateFormatOptions.timeZoneName} is not supported. UTC used instead.`);
      this.dateTimeFormat = new Intl.DateTimeFormat(this.locale, {timeZone: 'UTC'});
      this.offset = 120;
    }

    this.numberFormat = new Intl.NumberFormat(this.locale);
    this.currencyFormat = new Intl.NumberFormat(this.locale, this.currencyOptions);
  }

  public map(): IInvoiceFormData {

    this.mapAddress();
    this.mapReference();
    this.mapPaymentTerms();
    this.mapText();
    this.mapItems();
    this.mapTotals();
    return this.formData;
  }

  private mapAddress(): void {

    this.formData.address = [];

    this.formData.address.push(this.receiver.header.name || '');
    this.formData.address.push(this.receiver.header.nameAdd || '');
    this.formData.address.push(this.receiver.address.street || '');
    this.formData.address.push(this.receiver.address.postalCode + ' ' + this.receiver.address.city);
  }

  private mapReference(): void {

    this.formData.invoiceId = this.invoice.header.id ? this.invoice.header.id.toString() : '';
    if (this.invoice.header.issuedAt) {
      console.log('DateTimeFormat resolved options: ', this.dateTimeFormat.resolvedOptions());
      if (this.dateTimeFormat.resolvedOptions().timeZone === 'UTC') {
        const issuedAt = new Date(this.invoice.header.issuedAt);
        console.log('Timezone offset: ', this.offset);
        const printDate = new Date(issuedAt.getTime() + this.offset * 60 * 1000);
        console.log('print date: ', printDate.toLocaleString());
        this.formData.invoiceDate = this.dateTimeFormat.format(printDate);
      } else {
        this.formData.invoiceDate = this.dateTimeFormat.format(new Date(this.invoice.header.issuedAt));
      }
      console.log('Rechnungsdatum: ', this.formData.invoiceDate);
    }
    this.formData.customerId = this.receiver.header.id ? this.receiver.header.id.toString() : '';
    this.formData.billingPeriod = this.invoice.header.billingPeriod || '';
  }

  private mapPaymentTerms(): void {

    this.formData.paymentTerms = this.invoice.header.paymentTerms || '';
  }

  private mapText(): void {

    this.formData.text = this.invoice.header.invoiceText || '';
  }

  private mapItems(): void {

    this.formData.items = [];

    if (this.invoice.items) {
      this.invoice.items.forEach(item => {
        const mappedItem: IInvoiceItemFormData = {} as IInvoiceItemFormData;
        mappedItem.itemId = item.id ? item.id.toString() : '';
        mappedItem.description = item.description || '';
        mappedItem.quantity = item.quantity ?
          this.numberFormat.format(item.quantity) :
          this.numberFormat.format(0);
        mappedItem.unitPrice = item.pricePerUnit ?
          this.currencyFormat.format(item.pricePerUnit) :
          this.currencyFormat.format(0);
        const netValue = (item.quantity ? item.quantity : 0) * (item.pricePerUnit ? item.pricePerUnit : 0);
        mappedItem.netValue = this.currencyFormat.format(netValue);
        this.formData.items.push(mappedItem);
      });
    }
  }

  private mapTotals(): void {

    this.formData.vatPercentage = this.invoice.vatPercentage.toString();
    this.formData.cashDiscountPercentage = this.invoice.cashDiscountPercentage.toString();
    if (this.invoice.header.issuedAt) {
      try {
        this.formData.cashDiscountDueDate = this.dateTimeFormat.format(
            DateUtility.addDaysToDate(new Date(this.invoice.header.issuedAt), this.invoice.header.cashDiscountDays || 0));
      } catch {
        this.formData.cashDiscountDueDate = this.formData.invoiceDate;
      }
    }
    console.log('cashDiscountDueDate: ', this.formData.cashDiscountDueDate);
    this.formData.totalNetValue = this.currencyFormat.format(this.invoice.netValue);
    this.formData.totalVatAmount = this.currencyFormat.format(this.invoice.vatAmount);
    this.formData.totalGrossAmount = this.currencyFormat.format(this.invoice.grossValue);
    this.formData.cashDiscountBaseAmount = this.currencyFormat.format(this.invoice.cashDiscountBaseAmount);
    this.formData.cashDiscountAmount = this.currencyFormat.format(this.invoice.cashDiscountAmount);
    this.formData.payableAmount = this.currencyFormat.format(this.invoice.paymentAmount);
  }
}

