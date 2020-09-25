import {InvoiceData, ReceiverData} from 'jovisco-domain';

export interface InvoicePdfInputData {
    invoice: InvoiceData;
    receiver: ReceiverData;
}
