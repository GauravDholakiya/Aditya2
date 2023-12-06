import { LightningElement,track } from 'lwc';

export default class GrajeLwc extends LightningElement {
    @track columns = [{
        label: 'Make',
        fieldName: 'Make',
        type: 'text',
        sortable: true
    },
    {
    label: 'Model',
    fieldName: 'Model',
    type: 'text',
    sortable: true
    },
    {
        label: 'Year',
        fieldName: 'Year',
        type: 'Date',
        sortable: true
    },
    
];
@track data = [{'Make' :'gaurav', 'Model' :'Jay', 'Year' :'2022','id':1}];
strMake;
strModel;
strYear;
makeChangedHandler(event){
    this.strMake = event.target.value;
}
modelChangedHandler(event){
    this.strModel = event.target.value;
}
yearChangedHandler(event){
    this.strYear = event.target.value;
}

handleClick(){
   
    this.data = [...this.data,{'Make' : this.strMake, 'Model' : this.strModel, 'Year' : this.strYear,'id':1}];
   //console.log(this.fields);
}
}