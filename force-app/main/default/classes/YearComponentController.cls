public class YearComponentController {
    @AuraEnabled(cacheable=true)
    public static List<Assignment__C> getAssignment(String assId) {
        system.debug('assId >> ' + assId);
        return [SELECT Id,Name,Listing__r.Sub_Speciality__c,Listing__r.Provider_Type__C, Rate__c, Unit__c,Provider_PO_Status__c,Client_PO_Status__c from Assignment__C where Listing__c = :assId and Provider_PO_Status__c='Completed' and Client_PO_Status__c ='Completed' and CreatedDate = LAST_N_DAYS:365 and Status__c Not IN ('Cancelled','Withdraw')order by Rate__c desc limit 1];
    }
}