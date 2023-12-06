import { LightningElement,api,track } from 'lwc';

export default class Clinical_path extends LightningElement {
@track boolVisible = true;
@track boollst = false ;
 @track list = [
        {
            label: 1,
            Name: '1',
        },
        {
            label: 2,
            Name: '2',
        },
        {
            label: 3,
            Name: '3',
        },
        {
            label: 4,
            Name: '4',
        },
        {
            label: 5,
            Name: '5',
        },
    ];
    @track lst2;
   handleClick(event) { 
   this.boolVisible = false;
   this.lst2 = this.list;
   this.boollst = true;

}
/*@api isScroller = false;
@track list = [
   {
      label: '1',
      class: 'clinical-path__item sldc-path__item sldc-is-complete'
   },
   {
      label: '2',
      class: 'clinical-path__item sldc-path__item sldc-is-complete'
   },
   {
      label: '3',
      class: 'clinical-path__item sldc-path__item sldc-is-complete'
   },
   {
      label: '4',
      class: 'clinical-path__item sldc-path__item sldc-is-complete'
   },
   {
      label: '5',
      class: 'clinical-path__item sldc-path__item sldc-is-complete'
   }
];
currentScrollPosition = 0;
stepWidth=53;
lastStepWidth = 28;
isLastStep =false;
maxWidth =224;

addItem(){
   this.list.push({
      label :this.list+1,
      class:'clinical-path__item sldc-path__item sldc-is-incomplete'
   });
   this.resetScrollPosition();

}
removeItem(){
   if(this.list.length > 3){
      this.list.pop();
      this.resetScrollPosition();
   }
}
resetScrollPosition(){
   this.isLastStep =false;
   this.setScrollPosition(0);
}
scrollLeft(){
   if(this.currentScrollPosition > 0 ){
      let newPosition =this.currentScrollPosition - this.stepWidth;

      if(this.isLastStep){
         newPosition = this.currentScrollPosition - this.lastStepWidth;
         this.isLastStep =false;
      }
      this.setScrollPosition(newPosition);
   }
}
scrollRight(){
   if(this.isPathfullWidth && !this.isLastStep){
      let newPosition = this.currentScrollPosition + this.stepWidth;
      if(newPosition +this.getPathWidth() > this.list.length * this.stepWidth){
         newPosition = this.currentScrollPosition + this.lastStepWidth;
         this.isLastStep =true;
      }
      this.setScrollPosition(newPosition);
   }
}

setScrollPosition(newPosition){
   this.currentScrollPosition = newPosition;
   this.template.querySelector('.clinical-path__list').style.right='${newPosition}px';
}
getPathWidth(){
   return this.template.querySelector('.clinical-path__list').offsetWidth;
}
isPathfullWidth(){
   return this.getPathWidth() >= this.maxWidth;
}*/

}