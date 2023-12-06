trigger AllEmail on Contact (after insert,before insert,before delete) {
   AllEmailHandler handler = new AllEmailHandler();
   String jsonStringnew = json.serialize(Trigger.NEW);
   string jsonStringold = json.serialize(Trigger.old);
    for(contact con : trigger.new){
        if(con.Email == Null){
            con.Email = [select Default_Email__c from account where id =: con.AccountId].Default_Email__c;
        }
    }
    if(trigger.IsInsert){
     AllEmailHandler.InsertAllEmails(jsonStringnew);
    }
    if(trigger.Isdelete){
     AllEmailHandler.deleteAllEmail(jsonStringold); 
    }

}