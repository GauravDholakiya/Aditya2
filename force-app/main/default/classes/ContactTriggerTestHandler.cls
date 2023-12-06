public class ContactTriggerTestHandler {
    
    public static list<contact> contactHandler(list<Contact> Conlist){
        list<contact> clist = new list<contact>();
        map<id,Contact> contactMap = new map<id,Contact>();
        for(Contact cc : [Select id,name,AccountId from Contact where AccountID != null]){
            if(contactMap.containsKey(cc.AccountId)){
                
            }
            else
            {
                contactMap.put(cc.AccountID,CC);
            }
        }
            for(Contact c : Conlist){
                if(contactMap.containsKey(c.AccountId)){
                    clist.add(c);
                }
            }
            return clist;
        
    }

}