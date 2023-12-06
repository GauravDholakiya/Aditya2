trigger SendMailToAdminsUpdateTrigger on Contact (after update) {
    for( Id contactId : Trigger.newMap.keySet() )
    {
        if( Trigger.oldMap.get( contactId ).Status__c != Trigger.newMap.get( contactId ).Status__c )
        {
            SendMailToAdmins.sendEmailafter(trigger.new);
        }
    }
}