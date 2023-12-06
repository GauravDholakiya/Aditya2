public with sharing class NotificationController {
    
    @AuraEnabled(cacheable=true)  
    public static Notification_Banner__mdt getBannerDetail() {
        
        return [ 
            SELECT Id, Start_Date__c, End_Date__c, Message__c
            FROM Notification_Banner__mdt 
            where label ='Notification Banner' 
            LIMIT 1
        ];
    }
    
}