global class UserBatch implements Database.Batchable<sObject> {
    
    global Database.QueryLocator start(Database.BatchableContext BC) {
        String query = 'SELECT Id, FirstName, LastName, ManagerId, Terminated_Date__c FROM User where Terminated_Date__c < TODAY';
        return Database.getQueryLocator(query);
    }
     
    global void execute(Database.BatchableContext BC, List<User> UserList) {
        system.debug(UserList); 
        system.debug(UserList.size());
        set<id> ManagerIds = new set<id>();
        for(user u :[select ManagerId from user]){
            if(u.ManagerId != null){
                ManagerIds.add(u.ManagerId);
            }
        }
        for(User u : UserList) {        
            Boolean IsManager = ManagerIds.contains(u.Id);
            
                
                if(u.ManagerId != null){
                    
                }
                else{
                    if(!IsManager){
                        //put code to run a flow
                    }
                }
            
          
        }
        
         
    }   
     
    global void finish(Database.BatchableContext BC) {
        
    }
}