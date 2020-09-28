import {BaseForm} from './base-form';
import {IInvoiceFormData} from './invoice-form-data';
import PDFDocument = PDFKit.PDFDocument;
import {FormOptions} from './form-options';

export class InvoiceForm extends BaseForm {

    protected static readonly title: string = 'Rechnung';
    protected static readonly author: string = 'JOVISCO GmbH';

    private data: IInvoiceFormData;

    constructor(options: FormOptions, data: IInvoiceFormData) {

        const info: PDFKit.DocumentInfo = {} as PDFKit.DocumentInfo;
        info.Title = `${InvoiceForm.title} ${data.invoiceId}`;
        info.Author = InvoiceForm.author;
        info.Producer = info.Author;
        info.Creator = info.Author;
        info.CreationDate = new Date();
        info.Keywords = info.Title;

        super(options, info);

        this.data = data;
    }

    public getId(): string {
        return this.data.invoiceId;
    }

    public print(): void {

        this.printAddress();
        this.printSubject();
        this.printReference();
        this.printBillingPeriod();
        this.printPageNo(1, 1);

        let posY;

        posY = this.printItems();
        posY = this.printTotals(posY);
        posY = this.printPaymentTerms(posY);
        this.printInvoiceText(posY);
    }

    private printAddress(): void {

        const posX = 70, posY = 155;

        this.setTextFont()
            .text(this.data.address[0] || ' ', posX, posY, {align: 'left'})
            .text(this.data.address[1] || ' ', posX, posY + 15, {align: 'left'})
            .text(this.data.address[2] || ' ', posX, posY + 30, {align: 'left'})
            .text(this.data.address[3] || ' ', posX, posY + 45, {align: 'left'})
            .text(this.data.address[4] || ' ', posX, posY + 60, {align: 'left'});
    }

    private printSubject(): void {

        this.doc.font(BaseForm.defaultFont)
            .fontSize(24)
            .fillColor(BaseForm.formColor)
            .text(InvoiceForm.title, BaseForm.startPosX, 255);
    }

    private printReference(): void {

        const posX = 395.0;
        let posY = 267.0;

        this.setFormFont()
            .text('Bitte bei Zahlung angeben:', posX, posY, {underline: true});

        posY = posY + 17;

        this.setTextFont()
            .text('Kd.Nr.', posX, posY, {align: 'left'})
            .text('Re.Nr.', posX, posY + 15, {align: 'left'})
            .text('Datum', posX, posY + 30, {align: 'left'})
            .text(this.data.customerId, posX + 80, posY, {align: 'right'})
            .text(this.data.invoiceId, posX + 80, posY + 15, {align: 'right'})
            .text(this.data.invoiceDate, posX + 65, posY + 30, {align: 'right'});
    }

    private printBillingPeriod(): void {

        const posX = BaseForm.startPosX, posY = 314;

        this.setTextFont()
            .text(`Leistungszeitraum ${this.data.billingPeriod}`, posX, posY, {align: 'left'});
    }

    private printPageNo(pageNo: number, pages: number): void {

        const posX = 395, posY = 335;

        this.setFormFont()
            .text(`Seite ${pageNo.toString()}/${pages.toString()}`, posX, posY, {align: 'left'});
    }

    private printItems(): number {

        this.printItemColumnHeaders();

        const posX = 66.1;
        let posY = 375.0;

        this.data.items.forEach(item => {
            this.setTextFont()
                .text(item.itemId, posX, posY, {align: 'center', width: 15})
                .text(item.quantity, posX + 30, posY, {align: 'right', width: 35})
                .text(item.description, posX + 89, posY, {align: 'left', width: 220})
                .text(item.unitPrice, posX + 310, posY, {align: 'right', width: 60})
                .text(item.netValue, posX + 387, posY, {align: 'right', width: 75});

            posY = posY + 10 + Math.ceil(item.description.length / 40) * 15;

        });

        return posY;
    }

    private printItemColumnHeaders(): void {

        let posY = 12.4 * BaseForm.pointsPerCm;

        this.printLine(posY);

        posY = posY + 3;

        this.setFormFont()
            .text('Pos', 67.1, posY, {lineBreak: false})
            .text('Menge', 100.0, posY, {lineBreak: false})
            .text('Beschreibung', 155.0, posY, {lineBreak: false})
            .text('Einzelpreis', 392.0, posY, {lineBreak: false})
            .text('Gesamtpreis', 477.0, posY, {lineBreak: false});

        posY = posY + 12;

        this.printLine(posY);
    }

    private printTotals(y: number): number {
        let posY = y;
        this.printLine(posY);

        posY = posY + 3;

        this.setFormFont()
            .text('Nettobetrag', 100.0, posY, {align: 'left'})
            .text(`${this.data.vatPercentage}% MwSt`, 260.0, posY, {align: 'left'})
            .text('Bruttobetrag', 477.0, posY, {lineBreak: false});


        posY = posY + 12;

        this.printLine(posY);

        posY = posY + 10;

        this.setTextFont()
            .text(this.data.totalNetValue, 75.0, posY, {align: 'right', width: 75})
            .text(this.data.totalVatAmount, 230.0, posY, {align: 'right', width: 75})
            .text(this.data.totalGrossAmount, 453.1, posY, {align: 'right', width: 75});

        posY = posY + 25;

        this.printLine(posY);

        posY = posY + 3;

        if (+this.data.cashDiscountPercentage > 0) {
          this.setFormFont()
            .text('Skontobasis', 100.0, posY, {align: 'left'})
            .text(`Skonto ${this.data.cashDiscountPercentage}%`, 260.0, posY, {align: 'left'})
            .text(`Zahlbar bis spätestens ${this.data.cashDiscountDueDate}`, 395.0, posY, {lineBreak: false});

          posY = posY + 12;

          this.printLine(posY);

          posY = posY + 10;

          this.setTextFont()
            .text(this.data.cashDiscountBaseAmount, 75.0, posY, {align: 'right', width: 75})
            .text(this.data.cashDiscountAmount, 230.0, posY, {align: 'right', width: 75})
            .text(this.data.payableAmount, 453.1, posY, {align: 'right', width: 75});

          posY = posY + 25;

          this.printLine(posY);
        }

        return posY;
    }

    private printPaymentTerms(y: number): number {
        let posY = y;
        if (this.data.paymentTerms) {
            posY = posY + 20;
            this.setFormFont()
                .text(`Zahlungsbedingungen: ${this.data.paymentTerms}`, BaseForm.startPosX, posY, {align: 'left'});
        }

        return posY;
    }

    private printInvoiceText(y: number): number {
        let posY = y;
        if (this.data.text) {
            posY = posY + 25;
            this.setTextFont()
                .text(this.data.text, BaseForm.startPosX, posY, {align: 'left'});
        }

        return posY;
    }

    protected setFormFont(): PDFDocument {

        return this.setFont(BaseForm.defaultFont, BaseForm.smallFontSize, BaseForm.formColor);
    }

    protected setTextFont(): PDFDocument {

        return this.setFont(BaseForm.defaultFont, BaseForm.defaultFontSize, BaseForm.textColor);
    }
}
