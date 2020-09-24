import {BaseForm, FormOptions} from '../lib/printforms';

describe('PDF tests', () => {
    it('should log the __dirname', () => {
        console.log('__dirname: ', __dirname);
    });

    it('should be able to create the base form', () => {
        const options: FormOptions = {
            headerImagePath: __dirname + '/../lib/assets/img/jovisco-letter-head.png',
            footerImagePath: __dirname + '/../lib/assets/img/jovisco-letter-foot.png',
            addressLineImagePath: __dirname + '/../lib/assets/img/adresse_mini.jpg'
        };
        const doc = new BaseForm(options);
        expect(doc).toBeDefined();
    });
});
