import {BaseForm} from '../lib/printforms';

describe('PDF tests', () => {
    it('should log the image paths', () => {
        console.log('__dirname: ', __dirname);
        // @ts-ignore
        console.log('Header Image Path: ', BaseForm.headerImagePath);
        // @ts-ignore
        console.log('Footer Image Path: ', BaseForm.footerImagePath);
        // @ts-ignore
        console.log('Address Line Image Path: ', BaseForm.addressLineImagePath);
    });

    it('should be able to create the base form', () => {
        const doc = new BaseForm();
        expect(doc).toBeDefined();
    });
});
