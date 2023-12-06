@isTest
public class RollupTotalOrderAmountTest {
    @isTest
    Public static void sumOrderTest(){
        
        Account acc = new Account();
        acc.Name = 'Test Account';
        insert acc;
        
        Contract cont = new Contract();
        cont.Name = 'Test Contract';
        cont.AccountId = acc.Id;
        cont.Status = 'Draft';
        insert cont;
        
        Product2 p = new Product2();
        p.Name = ' Test Product ';
        p.Description='Test Product';
        p.productCode = 'TP01';
        p.isActive = true;
        insert p; 
        
        Id pricebookId = Test.getStandardPricebookId();
        
        PricebookEntry standardPrice = new PricebookEntry();
        standardPrice.Pricebook2Id = pricebookId;
        standardPrice.Product2Id = p.Id;
        standardPrice.UnitPrice = 1;
        standardPrice.IsActive = true;
        standardPrice.UseStandardPrice = false;
        insert standardPrice ;
        
        Order o = new Order();
        o.Name = 'Test Order';
        o.Status = 'Draft';
        o.EffectiveDate = system.today();
        o.EndDate = system.today() + 4;
        o.AccountId = acc.id;
        o.Pricebook2Id =  pricebookId ;
        insert o;
        
        OrderItem i = new OrderItem();
        i.OrderId = o.id;
        i.Quantity = 1;
        i.UnitPrice = 1000;
        i.Product2id = p.id;
        i.PricebookEntryId=standardPrice.id;
        insert i;
        
    }

}