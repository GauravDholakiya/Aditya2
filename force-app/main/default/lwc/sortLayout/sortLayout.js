import { LightningElement, api, track } from "lwc";

export default class sortLayout extends LightningElement {
  // for toggle buttons
  @track sortOneValue ;
  @track groupTwoValue;
  @track sortByDirection;
  @track thenByDirection;
  @track sortByDirectionDefaultAsc=false;
  @track sortDisabled;
  @track groupDisabled=true;
  @track selectGroupDisabled=true;
  @api initialData;


  get Options() {
    return [
      { label: 'Name', value: 'name' },
      { label: 'Website', value: 'website' },
      { label: 'Phone', value: 'phone' },
      { label: 'Balance', value: 'amount' },
      { label: 'CloseAt', value: 'closeAt' },
    ]
  }

  sortBy(e) {
    this.sortOneValue = e.target.value;
    console.log('sortBy:' + e.target.value + '  direction: ' + this.sortByDirection);
    let detes = [{ sort: this.sortOneValue, direction: this.sortByDirection ? 'DSC' : 'ASC' }];
    this.groupTwoValue = '';
    this.thenByDirection=false;
    // sort widgets
    this.sortDisabled=false;
    this.selectGroupDisabled=false;
    this.groupDisabled=true;
    const event = new CustomEvent('sort', {
      detail: detes
    });
    this.dispatchEvent(event);
}

  groupAndSortBy(e) {
    if (!e.target.value) {
      this.thenByDirection = !this.thenByDirection;
    } else {
      this.groupTwoValue = e.target.value;
    }
    let detes=[];
    console.log('group and sort');
    if (this.sortOneValue == this.groupTwoValue) {
      this.groupTwoValue = '';
      this.thenByDirection = false;
      this.selectGroupDisabled = true;
      this.groupDisabled=true;
      detes = [{ sort: this.sortOneValue, direction: this.sortByDirection ? 'DSC' : 'ASC' }];
    } else {
      console.log('sortOne: ' + this.sortOneValue);
      console.log('groupTwo: ' + this.groupTwoValue);
      this.groupDisabled = false;
      detes = [{ sort: this.sortOneValue, direction: this.sortByDirection ? 'DSC' : 'ASC' },
      { sort: this.groupTwoValue, direction: this.thenByDirection ? 'DSC' : 'ASC' }];
    }
    console.log('1 - sortBy:' + this.sortOneValue + " direction: " + this.sortByDirection? 'DSC' : 'ASC');
    console.log('2 - groupBy:' + this.groupTwoValue + '  direction: ' + this.thenByDirection? 'DSC' : 'ASC');
    const event = new CustomEvent('sort', {
      detail: detes
    });
    this.dispatchEvent(event);
  }

  changeSortDirection(e) {
    if (this.sortByDirectionDefaultAsc || !this.sortByDirection) {
      this.sortByDirectionDefaultAsc = false;
    }
    this.sortByDirection = !this.sortByDirection;
    if (!this.sortOneValue) {
      console.log('you have to select a sort value');
      return;
    }
    // console.log('sorting by: ' + this.sortOneValue);
    let detes = [{ sort: this.sortOneValue, direction: this.sortByDirection ? 'DSC' : 'ASC' }];

    const event = new CustomEvent('sort', {
      detail: detes
    });
    this.dispatchEvent(event);

  }

}