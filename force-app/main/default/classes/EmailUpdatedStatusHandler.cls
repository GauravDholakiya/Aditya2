public class EmailUpdatedStatusHandler {
    
    public static void updateInspectionEmailStatus(list<EmailMessage> emailMessageLst){
        
        list<Account> inspectionLst = new list<Account>();
        for(EmailMessage em : emailMessageLst){
            if(em.IsOpened != null){
                Account ir = new Account();
                ir.Id = em.RelatedToId;
                if(em.IsOpened == true){
                    ir.Email_Delivery_Status__c = 'Read';
                }
                else if(em.IsOpened == false){
                    ir.Email_Delivery_Status__c = 'Unread';
                }
                inspectionLst.add(ir);
            }
        }
        
        if(inspectionLst.size()>0){
            update inspectionLst;
        }
        
    }
       


}