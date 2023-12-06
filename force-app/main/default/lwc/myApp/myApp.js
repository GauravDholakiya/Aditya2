import { LightningElement,api, track } from "lwc";
import fetchDataHelper from './fetchDataHelper';

const columns = [
    { label: 'Name', fieldName: 'name',sortable: "true" },
    { label: 'Website', fieldName: 'website', type: 'url',sortable: "true" },
    { label: 'Phone', fieldName: 'phone', type: 'phone',sortable: "true" },
    { label: 'Balance', fieldName: 'amount', type: 'currency' ,sortable: "true"},
    { label: 'CloseAt', fieldName: 'closeAt', type: 'date' ,sortable: "true"},
];
export default class App extends LightningElement {
    @api initialData = [];
    @track tableData=[];
    @track columns = columns;
    @track sortBy;
    @track sortDirection;

    async connectedCallback() {
        const data = await fetchDataHelper({ amountOfRecords: 100 });
        this.initialData = data;
        this.tableData = data;
    }
    handleSort(event) {
        var change = false;
        var detes = event.detail;
        let { sort, direction } =detes[0];
        if (detes.length>1) {let { group, gdirection}=detes[1];}
        if (sort) {
            this.sortBy = sort;
            change = true;
        }
        if (direction) {
            this.sortDirection = direction;
            change = true
        }
        this.sortData(sort, direction);
        //console.log(JSON.parse(JSON.stringify(this.tableData[0])).name);
    }

    sortData(fieldname, direction) {
        //console.log('Sorting by name: ' + fieldname + " direction: " + direction);
        let parseData = JSON.parse(JSON.stringify(this.tableData));
        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };
        // cheking reverse direction
        let isReverse = direction === 'ASC' ? 1 : -1;
        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        //console.log(JSON.parse(JSON.stringify(this.tableData[0])).name + "::" + parseData[0].name);
        this.tableData = parseData;
    }
}