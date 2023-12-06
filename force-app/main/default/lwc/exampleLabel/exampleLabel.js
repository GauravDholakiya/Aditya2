import { LightningElement , api} from 'lwc';

export default class ExampleLabel extends LightningElement {
    @api recordId;
    
    handleSubmit(event) {
        console.log('onsubmit event'+ event.detail.fields);
    }
    handleSuccess(event) {
        console.log('onsuccess event', event.detail.id);
    }
}