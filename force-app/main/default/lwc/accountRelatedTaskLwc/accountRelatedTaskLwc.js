import { LightningElement, track, wire, api } from 'lwc';
import getTasks from '@salesforce/apex/AccountRelatedTaskController.getTasks';
export default class AccountRelatedTaskLwc extends LightningElement {
    @api recordId;
    @track tasks;
    @track columns = [
        { label: 'Subject', fieldName: 'TaskLink', type: 'url' ,typeAttributes: {label: { fieldName: 'Subject' }, target: '_blank'}},
        { label: 'Status', fieldName: 'Status', type: 'Text' },
        { label: 'Due Date', fieldName: 'ActivityDate', type: 'text' },
        { label: 'Priority', fieldName: 'Priority', type: 'text' },
        { label: 'Name', fieldName: 'WhoLink', type: 'url',typeAttributes: {label: { fieldName: 'WhoName' }, target: '_blank'} },
        { label: 'Related To', fieldName: 'WhatLink', type: 'url',typeAttributes: {label: { fieldName: 'WhatName' }, target: '_blank'} },
        { label: 'Account Name', fieldName: 'AccountLink', type: 'url',typeAttributes: {label: { fieldName: 'AccountName' }, target: '_blank'} }
              
    ];
    @wire(getTasks, { AccId: '$recordId' })
    WireAssignmentRecords({ data }) {
        if (data) {
            let tempRecords = JSON.parse(JSON.stringify(data));
            tempRecords = tempRecords.map(row => {
                return { ...row, AccountName: row.Account.Name,WhatName:row.What.Name,WhoName:row.Who.Name,TaskLink:'/'+row.Id,WhoLink:'/'+row.WhoId,WhatLink:'/'+row.WhatId,AccountLink:'/'+row.AccountId};
            })
            this.tasks = tempRecords;
        }
    }
    handleClick(event) {
        const rowNode = event.toElement.closest('tr');

    // Row index (-1 to account for header row)
    console.log(rowNode.rowIndex - 1);

    // Row Id
    console.log(rowNode.dataset.rowKeyValue);

    }
}