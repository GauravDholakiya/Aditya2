import { LightningElement , track , wire } from 'lwc';
import getRecords from '@salesforce/apex/DataTableLwcController.GetRecords';

export default class DataTableExample extends LightningElement {
    @track contacts;
    @track columns = [
        { 
            label: 'Name', 
            fieldName: 'Name',
            type: 'Text' 
        },
        { 
            label: 'Phone',
            fieldName: 'Phone',
            type: 'phone' 
        },
        { 
            label: 'Email',
            fieldName: 'Email',
            type: 'email' 
        },
        { 
            label: 'Account',
            fieldName: 'Account.Name',
            type: 'Text'
        }    
              
    ];

    @wire(getRecords)
    WireAssignmentRecords({ data }) {
        if (data) {
            
            let tempRecords = JSON.parse(JSON.stringify(data));
            console.log(tempRecords); 
            this.contacts = tempRecords;
        }
    }
}