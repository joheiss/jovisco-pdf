export interface IInvoiceItemFormData {
    itemId: string;
    quantity: string;
    description: string;
    unitPrice: string;
    netValue: string;
}

export interface IInvoiceFormData {
    address: string[];
    invoiceId: string;
    invoiceDate: string;
    customerId: string;
    billingPeriod: string;
    totalNetValue: string;
    vatPercentage: string;
    totalVatAmount: string;
    totalGrossAmount: string;
    cashDiscountPercentage: string;
    cashDiscountBaseAmount: string;
    cashDiscountAmount: string;
    payableAmount: string;
    cashDiscountDueDate: string;
    paymentTerms: string;
    text: string;
    items: IInvoiceItemFormData[];
}
