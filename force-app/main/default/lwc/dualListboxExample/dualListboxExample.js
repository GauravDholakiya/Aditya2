import { LightningElement,track } from 'lwc';

export default class DualListboxExample extends LightningElement {
    @track options = [
        { label: 'English', value: 'en' },
        { label: 'German', value: 'de' },
        { label: 'Spanish', value: 'es' },
        { label: 'French', value: 'fr' },
        { label: 'Italian', value: 'it' },
        { label: 'Japanese', value: 'ja' },
    ];
@track selected = [];
@track tempselected =[];
@track tempfilter = [];
handleSelection(event) {
    console.log('Hello');
    this.tempfilter = event.currentTarget.dataset.value;
    this.options.forEach(ele => {
        if(ele.value === event.currentTarget.dataset.value) {
            console.log(ele);
            this.tempselected.push(ele);
            
        }
    });
    console.log('selected optioon',this.selected);
   // this.options = this.options.filter(ele => ele.value !== event.currentTarget.dataset.value);
}
handleSelectionChange(){
    for (let i of this.tempselected) {
        console.log('value of i',i);
        this.selected.push(i);
       // this.options.pop(i);
    }
     this.options = this.options.filter(ele =>ele.value !== this.tempfilter);
    //this.selected =[...this.selected,this.tempselected];
    this.tempselected = [];
    this.tempfilter = undefined;
}
}