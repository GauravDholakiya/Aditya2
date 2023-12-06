trigger Accounttrigger on Account (before insert , before update) {
    
    if(trigger.isBefore && trigger.isInsert) {
        system.debug('I am in before insert');
        
    }
    if(trigger.isupdate) {
        if(trigger.isBefore){
            for(Account acc : trigger.new){
                system.debug('new account name is :- ' + acc.Name);
                system.debug('Old account name is :- ' + trigger.oldMap.get(acc.Id).Name);
            }
        }
        
    }

}