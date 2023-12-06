trigger ContactTriggerTest on Contact (before insert) {
    
    list<Contact> conlist = ContactTriggerTestHandler.contactHandler(trigger.new);
    system.debug('contact list'+conlist);
    for(contact cc : conlist){
        cc.AccountId.addError('Account is already there');
    }
}