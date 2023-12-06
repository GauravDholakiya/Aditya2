trigger EmailMessageTrigger on EmailMessage (after insert,after update) {
    
    list<EmailMessage> emailMessageLst = new list<EmailMessage>();
    if(trigger.isAfter){
        for(EmailMessage em : trigger.new){
            if(em.RelatedToId != null && em.RelatedToId.getSObjectType().getDescribe().getName() == 'Account'){
                emailMessageLst.add(em);
            }
        }
    }
    
    if(emailMessageLst.size()>0){
        EmailUpdatedStatusHandler.updateInspectionEmailStatus(emailMessageLst);
    }

}