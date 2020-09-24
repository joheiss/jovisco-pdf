import PDFKit from 'pdfkit';
import * as fs from 'fs';
import PDFDocument = PDFKit.PDFDocument;
import {FormOptions} from './form-options';

export class BaseForm {

  protected static readonly pointsPerCm: number = 28.3;
  protected static readonly startPosX: number = 65.1;
  protected static readonly endPosX: number = 530.2;
  protected static readonly defaultFont: string = 'Helvetica';
  protected static readonly defaultFontSize: number = 12;
  protected static readonly smallFontSize: number = 9;
  protected static readonly textColor = 'black';
  protected static readonly formColor = '#005F69';
  protected static readonly imagePath = __dirname + 'node_modules/jovisco-pdf/dist/';

  protected doc: PDFDocument;

  constructor(protected options: FormOptions, info?: PDFKit.DocumentInfo) {

    console.log('Header Image Path: ', options.headerImagePath);
    console.log('Footer Image Path: ', options.footerImagePath);
    console.log('Address Line Image Path: ', options.addressLineImagePath);
    this.doc = this.createForm(options, info);
  }



  public saveAs(path: string, callback: (err?: any) => void): void {

    this.doc.pipe(fs.createWriteStream(path))
      .on('finish', () => callback())
      .on('error', err => callback(err));

    this.doc.end();
  }

  public saveAsWithPromise(path: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // To determine when the PDF has finished being written successfully
      // we need to confirm the following 2 conditions:
      //
      //   1. The write stream has been closed
      //   2. PDFDocument.end() was called synchronously without an error being thrown
      let pendingStepCount = 2;
      const stepFinished = () => {
        if (--pendingStepCount === 0) {
          resolve();
        }
      };

      const writeStream = fs.createWriteStream(path);
      writeStream.on('close', stepFinished);
      this.doc.pipe(writeStream);
      this.doc.end();
      stepFinished();
    });
  }

  protected createForm(options: FormOptions, info: any): PDFDocument {

    return this.createDocument(info)
      .image(options.headerImagePath, 189.6, 0, {width: 226.4})
      .image(options.addressLineImagePath, BaseForm.startPosX, 141.5, {width: 201})
      .image(options.footerImagePath, BaseForm.startPosX, 764, {width: 481.1});
  }

  protected createDocument(info: PDFKit.DocumentInfo): PDFDocument {

    const doc = new PDFKit({
      autoFirstPage: true,
      size: [595.28, 841.89],
      layout: 'portrait'
    });

    doc.info = info;

    return doc;
  }

  protected setFont(font: string, fontSize: number, color: string): PDFDocument {

    return this.doc.font(font).fontSize(fontSize).fillColor(color);
  }

  protected printLine(posY: number): void {

    this.doc.strokeColor(BaseForm.formColor)
      .moveTo(BaseForm.startPosX, posY)
      .lineTo(BaseForm.endPosX, posY)
      .stroke();
  }
}
