import { LightningElement, track, wire} from 'lwc';

import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import PARTS_OBJECT from '@salesforce/schema/Part__c';
import MATERIAL_FIELD from '@salesforce/schema/Part__c.Material_Type__c';
import PART_CONDITION from '@salesforce/schema/Part__c.Condition__c';

export default class TreeColumn extends LightningElement {
    @track MaterialValue;
    @track ConditionValue;

    @wire(getObjectInfo, { objectApiName: PARTS_OBJECT })
    _partsInfo;

    @wire(getPicklistValues, { recordTypeId: '$_partsInfo.data.defaultRecordTypeId', fieldApiName: MATERIAL_FIELD})
    partMaterialPicklist;

    @wire(getPicklistValues, { recordTypeId: '$_partsInfo.data.defaultRecordTypeId', fieldApiName: PART_CONDITION})
    partConditionPicklist;

     handleChange(event) {
    //this.MaterialValue = event.detail; 
    if(event.target.name === 'Material Type'){
        this.MaterialValue = event.detail.value;
    }
    else if(event.target.name === 'Condition'){
    this.ConditionValue = event.detail.value;
    }
    
    }
    
}