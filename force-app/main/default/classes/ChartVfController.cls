public class ChartVfController {
    public List<Account> accList{get;set;}
    public string accString {get;set;}
    public Decimal inputText1{get;set;} 
    public Decimal inputText2{get;set;} 
    
    public Decimal inputText3{get;set;}
    public Decimal inputText4{get;set;}
    
    public ChartVfController(){
        inputText1 = NULL;
        inputText2 = NULL;
        
        inputText3 = NULL;
        inputText4 = NULL;
        accList = [select id,Name,Month__c,Amount__c from Account where Month__c != Null and Amount__c !=Null];
        accString = json.serialize(accList);
    }
    
    public void filterchartdata(Decimal inputText1,Decimal inputText2,Decimal inputText3,Decimal inputText4){
        this.inputText1 = inputText1;
        this.inputText2 = inputText2;
        this.inputText3 = inputText3;
        this.inputText4 = inputText4;
        
        
        string query = 'select id,name,Amount__c,Month__c from Account where Amount__c >='+ inputText1+ 'AND Amount__c <='+inputText2+'AND Month__c >='+inputText3+'AND Month__c <='+inputText4;
        
        accList = database.query(query);
        accString = json.serialize(accList);
        //system.debug('accList'+accList);
    }
    public void saveTextValue(){
        filterchartdata(inputText1,inputText2,inputText3,inputText4);
       
    }

}