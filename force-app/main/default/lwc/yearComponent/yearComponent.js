import { LightningElement, track, wire, api } from 'lwc';
import getAssignment from 
'@salesforce/apex/YearComponentController.getAssignment';

export default class YearComponent extends LightningElement {
    @api recordId;
    @track assignments;
    @track columns = [
        { label: 'Name', fieldName: 'Name', type: 'text' },
        {label: 'Rate', fieldName: 'Rate__c', type: 'currency'},
        {label: 'Rate per', fieldName: 'Unit__c', type: 'text'}
    ];

    @wire(getAssignment, {assId: '$recordId'}) 
    WireAssignmentRecords({error, data}){
        if(data){
            this.assignments = data;
            console.log(this.assignments);
            this.error = undefined;
        }else{
            this.error = error;
            this.assignments = undefined;
        }
        console.log(this.assignments);
    }
    
}