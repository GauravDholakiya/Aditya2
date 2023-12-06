import { LightningElement , track , wire } from 'lwc';
import getRecords from '@salesforce/apex/DataTableLwcController.getRecords';

export default class DataTableLwcExample extends LightningElement {
    @track contacts;
    @track columns = [
        { 
            label: 'Name', 
            fieldName: 'ContactLink',
            type: 'url' ,
            typeAttributes: {label: { fieldName: 'Name' }, target: '_blank'}
        },
        { 
            label: 'Phone',
            fieldName: 'Phone',
            type: 'phone' 
        },
        { 
            label: 'Email',
            fieldName: 'Email',
            type: 'Email' 
        },
        { 
            label: 'Account',
            fieldName: 'AccountLink',
            type: 'url',
            typeAttributes: {label: { fieldName: 'AccountName' }, target: '_blank'},
            cellAttributes: { iconName: 'standard:account' } 
        }    
              
    ];

    @wire(getRecords)
    WireAssignmentRecords({ data }) {
        if (data) {
            
            let tempRecords = JSON.parse(JSON.stringify(data));
            console.log(tempRecords);
            tempRecords = tempRecords.map(row => {
                return { ...row,
                         AccountName: row.Account.Name,
                         
                         ContactLink:'/'+row.Id,AccountLink:'/'+row.AccountId
                       };
            }) 
            this.contacts = tempRecords;
            console.log(this.contacts);
        }
    }
}