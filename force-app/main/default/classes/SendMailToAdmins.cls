public class SendMailToAdmins {
    public static void sendEmailafter(List<Contact> conList)
    {
        List<string> LastmodifiedUserEmail = new List<String>();
        List<string> adminsEmailId = new List<String>();
        Map<Id,List<String>> contactAddressMap = new Map<Id,List<String>>();
        
        for(User u:[select Id,Email,Profile.Name from user where Profile.Name ='ProfileB'])
        {
            adminsEmailId.add(u.Email);
        }
        
        for(Contact contact: [select Id,Status__c,LastModifiedBy.Email from Contact where Id In :conList]){
            if(contact.Status__c == 'Approved' || contact.Status__c == 'Deny')
            {
                String LastModifiedEmail = contact.LastModifiedBy.Email;
                system.debug('Admin Email who made change LastModifiedEmail'+contact.LastModifiedBy.Email);
                List<String> FinalEmailId = new list<String>();
                List<String> tempEmail = adminsEmailId.clone();
                system.debug('admin email'+tempEmail);
                if(tempEmail.contains(LastModifiedEmail)){
                    List<string> tempEmail1 = new List<string>();
                    tempEmail.Remove(tempEmail.indexOf(LastModifiedEmail));
                    tempEmail1 = tempEmail.clone();
                    FinalEmailId.addAll(tempEmail1);
                    system.debug('final Email'+tempEmail1);
                }
                else
                {
                    FinalEmailId.addAll(adminsEmailId);
                }
                system.debug('final email'+FinalEmailId);
                contactAddressMap.put(contact.Id,FinalEmailId);
                system.debug('map'+contactAddressMap);
            }
            
        }
        
        List<Messaging.SingleEmailMessage> allMails = new List<Messaging.SingleEmailMessage>();
        for(Contact c : conList){
            
            String EmailBody = c.FirstName + ' ' + c.LastName + ','+ ' '+'has been granted access to OH CDMS'+ '<br/>';
            String EmailSubject= c.FirstName + ' ' + c.LastName + ' '+c.Status__c +' '+'access to OH CDMS'+ '<br/>';
            List<string> EmailAddress = contactAddressMap.get(c.Id);
            
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();           
            mail.setToAddresses(EmailAddress);
            mail.setSubject(EmailSubject);            
            mail.setHtmlBody(EmailBody);
            allMails.add(mail);
            
            system.debug('email address'+EmailAddress);
            system.debug('all mail'+allMails);
            //Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
          
        }
        
        
        System.debug('You have made ' + Limits.getEmailInvocations() + ' email calls out of ' + Limits.getLimitEmailInvocations() + ' allowed');
        Messaging.sendEmail(allMails);
        // Messaging.SendEmailResult[] emailResults = Messaging.sendEmail(allMails, false);
        System.debug('You have made ' + Limits.getEmailInvocations() + ' email calls out of ' + Limits.getLimitEmailInvocations() + ' allowed');
        // system.debug('email result'+emailResults);
        //GlobalSendEmail.sendEmails(allMails);
        
    }
}