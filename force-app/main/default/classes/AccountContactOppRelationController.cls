public class AccountContactOppRelationController {
  public List<SelectOption> contactlist{set;get;}
    public List<SelectOption> Opportunitylist{set;get;}
    public Boolean ContactListRender{get;set;}
    public Boolean OppListRender{get;set;}
    public Id selectedAccId{get;set;} 
    public Id selectedConAccId{get;set;} 
    public AccountContactOppRelationController()
    {
        contactlist = new List<SelectOption>();
        Opportunitylist = new List<SelectOption>();
        
        
    }
    public List<SelectOption> AccountList
    {
        get
        {
            List<Account> accTemp = new List<Account>();
            accTemp = [Select Id,Name from Account];
            
            AccountList = new List<SelectOption>();
            
            for(Account acc : accTemp)
            {
                AccountList.add(new SelectOption(acc.Id, acc.Name));
            }
            return AccountList;
        }
        set;
    }
    
    public PageReference conValNew()
    {        
        contactlist.clear();
        List<Contact> ContactTemp = new List<Contact>();
        System.debug('selectedAccId--->>>' + selectedAccId);
        if(selectedAccId!=null)
        {
            ContactTemp = [Select Id,firstname,lastname , AccountId from contact where AccountId =: selectedAccId];
        }
        
        System.debug('ContactTemp---->>>>>' + ContactTemp);
        if(ContactTemp.isEmpty())
        {
            ContactListRender = false;
            Opportunitylist.clear();
            OppListRender = false;
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.Error,'No Contact Record Exist Regarding this Account'));
        }
        else{
            for(contact con : ContactTemp)
            {
                ContactListRender = true;
                contactlist.add(new SelectOption(con.AccountId, con.lastname));
                System.debug('contactlist--->>>>' + contactlist);
            }
            
        }
        
        
        return null;
    }
    
    public PageReference OppValNew()
    {        
        Opportunitylist.clear();
        List<Opportunity> OpportunityTemp = new List<Opportunity>();
        System.debug('selectedConAccId--->>>' + selectedConAccId);
        OpportunityTemp = [Select Id , Name from Opportunity where AccountId =: selectedConAccId];
        System.debug('OpportunityTemp---->>>>>' + OpportunityTemp);
        if(OpportunityTemp.isEmpty())
        {
            OppListRender = false;
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.Error,'No Opportunity Record Exist Regarding this Contact'));
        }
        else{
            OppListRender = true;
            for(Opportunity opp : OpportunityTemp)
            {
                Opportunitylist.add(new SelectOption(opp.Id, opp.Name));
                System.debug('Opportunitylist--->>>>' + Opportunitylist);
            }
        }
        
        
        return null;
    }
    public List<SelectOption> getcontactlist()
    {
        
        return contactlist;
    }
    public List<SelectOption> getOpportunitylist()
    {
        
        return Opportunitylist;
    }
    public Boolean getContactListRender()
    {
        
        return ContactListRender;
    }
     public Boolean getOppListRender()
    {
        
        return OppListRender;
    }
}