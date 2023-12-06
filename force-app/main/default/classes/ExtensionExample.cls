public Without Sharing class ExtensionExample{

    public class AccountWrapper{
        String Id;
        String Name;
        String AccountNumber;
        String Type;
        String Industry;
        

    } //A custom wrapper class to fool VF UI
    public AccountWrapper accountw {get;set;} // Bind Variable for VF.


    public ExtensionExample() {


       // String recId  = ApexPages.CurrentPage().getparameters().get('id'); //Fetch recordId from params
        Account acc = [select id ,name, AccountNumber, Type, Industry from Account where id='0012x00000MKv8pAAD' ];

        //Convert Account into wrapper
        accountw = new AccountWrapper();
        accountw.Id = acc.Id;
        accountw.Name = acc.Name;
        accountw.AccountNumber = acc.AccountNumber;
        accountw.Type = acc.Type;
        accountw.Industry = acc.Industry;



    }
    public void  doSubmit() {
        //Convert back wrapper into Account
        Account toBeUpdatedAccount = new Account ();
        toBeUpdatedAccount.Id =accountw.Id;
        toBeUpdatedAccount.Name =accountw.Name;
        toBeUpdatedAccount.AccountNumber =accountw.AccountNumber;
        toBeUpdatedAccount.Type =accountw.Type;
        toBeUpdatedAccount.Industry =accountw.Industry; 
        //Do DML
        update toBeUpdatedAccount;

    }
}