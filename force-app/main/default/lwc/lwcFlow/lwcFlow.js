import { LightningElement,api } from 'lwc';

export default class LwcFlow extends LightningElement {
    @api selectedAccs = [];
    @api selectedAccsString;
    @api accs = [];

    handleCheck(event) {
        if(!this.selectedAccs.includes(event.currentTarget.name))
            this.selectedAccs.push(event.currentTarget.name);
        else {
            for(let i = 0; i < this.selectedAccs.length; i++) {
                if(event.currentTarget.name === this.selectedAccs[i])
                this.selectedAccs.splice(i, 1);
            }
        }
        
        // eslint-disable-next-line @lwc/lwc/no-api-reassignments
        this.selectedAccsString = JSON.stringify(this.selectedAccs);
        
    }
}