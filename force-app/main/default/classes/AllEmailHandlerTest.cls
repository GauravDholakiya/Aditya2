@isTest
public class AllEmailHandlerTest {
@istest
    public static void dotest(){
    list<Account> acclist = new list<Account>(); 
    list<Contact> conlist = new list<Contact>();
    list<Contact> Conuplist = new list<Contact> ();
        test.startTest();
        For(integer i=0;i<200;i++){
            Account acc = new Account();
            acc.Name = 'Testing' +i;
            acc.Default_Email__c = 'Testing' + i + '@gmail.com';
            if(i==2 || i==3){
                acc.All_Emails__c = 'abcd' + i +'@gmail.com';
            }
            acclist.add(acc);
        }
        
         insert acclist;
        
            for(integer i=0;i<=500;i++){
                contact con = new contact();
                con.AccountId = acclist[1].Id;
                con.FirstName = 'First' + i;
                con.LastName ='Last' + i;   
                con.Email ='First' + i + 'Last' + i +'@gmail.com';
                conlist.add(con);
            }
          
        
        insert conlist;
        
        integer j=1;
        for(contact con :conlist){
            con.Email ='abcd'+j+'@gmail.com';
            Conuplist.add(con);
            j++;
        }
        update Conuplist;
        delete conlist;
        test.stopTest();
        
    }
}