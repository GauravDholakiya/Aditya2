public class AllEmailHandler {
    @future
    public static void InsertAllEmails(String jsonString){
        list<Contact> Conlist = (List<Contact>)Json.deserialize(jsonString,List<Contact>.class);
        set<id> accid = new set<id>();
        list<Account> acc = new list<Account>();
        list<string> emailall = new list<string>();
        list<string> conemail = new list<string>();
        
        for(Contact con : Conlist){
            if(con.AccountId != null){
                accid.add(con.AccountId);
            }
        }
        if(accid.size()>0){
        for(account ac :[select id,Name,All_Emails__c,Default_Email__c from account where id in :accid]){
            for(contact con : [select id,Name,Email from Contact where id in :Conlist and AccountId =:ac.Id]){
                if(con.Email != ac.Default_Email__c){
                conemail.add(string.valueOf(con.Email));
                }
            }
            if(ac.All_Emails__c != Null){
                emailall = ac.All_Emails__c.split(';');
				ac.All_Emails__c = string.join(emailall,';') +';'+ string.join(conemail,';');
                
            }
            else{
               ac.All_Emails__c = string.join(conemail,';'); 
            }
            acc.add(ac);
            conemail.clear();
        }
        update acc;
        }
    }

    @future
    public static void deleteAllEmail(string jsonStringold){
        
        list<Contact> conlist =(List<Contact>)Json.deserialize(jsonStringold,List<Contact>.class);
        set<id> accid = new set<id>();
        for(Contact con : conlist){
            if(con.AccountId != null){
                accid.add(con.AccountId);
            }
        }
        list<string> emailall = new list<string>();
        Map<Id,Account> accountMap = new Map<Id,Account>([select id,All_Emails__c from Account where id in :accid]);
        for(Contact con : conlist){
            if(accountMap.containsKey(con.AccountId)){
                Account acc = accountMap.get(con.AccountId);            
                emailall = acc.All_Emails__c.split(';');
                emailall.remove(emailall.indexOf(string.valueOf(con.Email)));
                acc.All_Emails__c=string.join(emailall,';');  
                emailall.clear();
            }
        }
        
        update accountMap.values();
    }
}