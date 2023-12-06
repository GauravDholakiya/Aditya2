public without sharing class DataTableLwcController {
    
    @AuraEnabled(cacheable=true)
    public static list<Contact> getRecords(){
        return [SELECT Id,Name,AccountId,Account.Name,Phone,Email 
                       FROM contact WHERE AccountId != null LIMIT 10 ];
    }
        
}