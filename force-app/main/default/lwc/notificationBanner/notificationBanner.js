import { LightningElement , wire} from 'lwc';
import getBannerDetail from '@salesforce/apex/NotificationController.getBannerDetail';

export default class NotificationBanner extends LightningElement {
    @wire(getBannerDetail) banner;

    get message() {
        return this.banner.data.Message__c;
    }

    StartDate() {
        return this.banner && this.banner.data ? this.banner.data.Start_Date__c : 'Loading...';
    }

    EndDate() {
        return this.banner && this.banner.data ? this.banner.data.End_Date__c : 'Loading...';
    }

    get IsDisplay() {

        let today = new Date();
        today.setMinutes(new Date().getMinutes() - new Date().getTimezoneOffset());
        
        // Return today's date in "YYYY-MM-DD" format
        let date = today.toISOString().slice(0,10); 

        let NotificationStartDate = this.StartDate();
        let NotificationEndDate = this.EndDate();

        if (date >= NotificationStartDate && date <= NotificationEndDate) {
            return true;
        }
        // eslint-disable-next-line no-else-return
        else {
            return false;
        }
    }

}