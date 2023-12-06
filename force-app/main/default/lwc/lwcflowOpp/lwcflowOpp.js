import { LightningElement,api } from 'lwc';

export default class LwcflowOpp extends LightningElement {
    @api selectedOpp = [];
    @api selectedOppString;
    @api opps = [];

    handleCheck(event) {
        if(!this.selectedOpp.includes(event.currentTarget.name))
            this.selectedOpp.push(event.currentTarget.name);
        else {
            for(let i = 0; i < this.selectedOpp.length; i++) {
                if(event.currentTarget.name === this.selectedOpp[i])
                console.log(this.selectedOpp);
                this.selectedOpp.splice(i, 1);
            }
        }
        
        // eslint-disable-next-line @lwc/lwc/no-api-reassignments
        this.selectedOppString = JSON.stringify(this.selectedOpp);
        
    }
}