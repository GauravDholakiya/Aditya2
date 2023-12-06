import { LightningElement, track } from 'lwc';

export default class LightningPath extends LightningElement {
    @track list = [{id:'pat-1', label:'1'},{id:'pat-2', label:'2'},{id:'pat-3', label:'3'}];
    @track showElementsBtn = true;
    @track showCollapseBtn = false;

    pathHandler(event) {
        let targetId = event.currentTarget.id;
        let len = targetId.length;
        let mainTarId = targetId.charAt(4);
        let targatPrefix = targetId.substring(5, len);
        var selectedPath = this.template.querySelector("[id=" +targetId+ "]");

        if(selectedPath){
            this.template.querySelector("[id=" +targetId+ "]").className='slds-is-active slds-path__item';
        }
        for(let i = 0; i < mainTarId; i++){
            let selectedPath = this.template.querySelector("[id=pat-" +i+ targatPrefix+"]");
            if(selectedPath){
                this.template.querySelector("[id=pat-" +i+ targatPrefix+"]").className='slds-is-complete slds-path__item slds-text-color_inverse';
            }
        }
        for(let i = mainTarId; i < 8; i++){
            if(i != mainTarId){
                let selectedPath = this.template.querySelector("[id=pat-" +i+ targatPrefix+"]");
                if(selectedPath){
                    this.template.querySelector("[id=pat-" +i+targatPrefix+ "]").className='slds-is-incomplete slds-path__item';
                }
            }
        }
    }

    showElements(event){
        this.list = [{id:'pat-1', label:'1'},{id:'pat-2', label:'2'},{id:'pat-3', label:'3'},{id:'pat-4', label:'4'},{id:'pat-5', label:'5'}];
        this.showElementsBtn = false;
        this.showCollapseBtn = true ;

    }
    showCollapse(event){
        this.list = [{id:'pat-1', label:'1'},{id:'pat-2', label:'2'},{id:'pat-3', label:'3'}];
        this.showElementsBtn = true;
        this.showCollapseBtn = false;

    }
}