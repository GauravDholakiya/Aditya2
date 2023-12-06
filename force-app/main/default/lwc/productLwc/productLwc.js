import { LightningElement, wire, track } from 'lwc';

import getProductType from '@salesforce/apex/ProductController.getProductType';
import getProductCategory from '@salesforce/apex/ProductController.getProductCategory';
let i=0;
export default class ProductLwc extends LightningElement {
    @track error;   
    @track ProductType = []; 
    @track ProductCategory = [];
    @track valueType = '';  
    @track valueCategory = '';
    
    @wire(getProductType)
    wiredProductType({ error, data }) {
        if (data) {
            for(i=0; i<data.length; i++) {
                this.ProductType = [...this.ProductType ,{value: data[i] , label: data[i]}];                                   
            } 
            console.log('ProductType',this.ProductType);           
            this.error = undefined;
        } else if (error) {
            this.error = error;
            
        }
    }
   
    @wire(getProductCategory)
    wiredProductCategory({ error, data }) {
        if (data) {
            for(i=0; i<data.length; i++) {
                this.ProductCategory = [...this.ProductCategory ,{value: data[i] , label: data[i]}];                                   
            } 
                       
            this.error = undefined;
        } else if (error) {
            this.error = error;
            
        }
    }
    
    get productTypeOptions() {
        return this.ProductType;
    }

    get productCategoryOptions() {
        return this.ProductCategory;
    }

    handleTypeChange(event) {
         this.valueType = event.detail.value;
        console.log('selected Type Option=' , this.valueType);

        //This is for event propagation
        
     /*   const filterTypeChangeEvent = new CustomEvent('filterchange', {
            // eslint-disable-next-line no-undef
            detail: {valueType },
        });
        // Fire the custom event
        this.dispatchEvent(filterTypeChangeEvent); */
    }

    handleCategoryChange(event) {
        this.valueCategory = event.detail.value;
       console.log('selected Category Option=' , this.valueCategory);

       //This is for event propagation
       
      /* const filterCategoryChangeEvent = new CustomEvent('filterchange', {
           // eslint-disable-next-line no-undef
           detail: {valueCategory },
       });
       // Fire the custom event
       this.dispatchEvent(filterCategoryChangeEvent); */
   }
}