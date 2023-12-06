public class SumOrdersHandler {
    
    Public static void sumOrders(list<Account> accList,Map<Id,Account> accMap){
        for(Account record: accList) {
            record.Grand_Total_Order_Amount__c = null;                          // Setting Grand Total Amount to null
        }
        for(AggregateResult result: [SELECT SUM(TotalAmount) Amt, AccountId Id FROM Order WHERE AccountId IN :accList GROUP BY AccountId]) {
            accMap.get((Id)result.get('Id')).Grand_Total_Order_Amount__c = string.valueof(result.get('Amt'));  // Assign Sum of all order Amount to Grand Total Order Amount
        }
    }
    
}