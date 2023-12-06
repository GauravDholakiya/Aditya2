public class RollupOrderHandler {
    
    
    public static void rollupOrder(list<Order> orderListOld,list<Order> orderListNew){
        
        Set<Id> accountIds = new Set<Id>();                           // To store set of Account Id
        
        if(orderListOld != null && orderListOld.size() > 0) {
            for(Order record: orderListOld) {
                accountIds.add(record.AccountId);                     // Add Account Id to set
            }
        }
        if(orderListNew != null && orderListNew.size() > 0) {
            for(Order record: orderListNew) {
                accountIds.add(record.AccountId);                    // Add Account Id to set
            }
        }
        
        If(accountIds.size() > 0){
            update [SELECT Id FROM Account WHERE Id IN :accountIds];
        }
        
    }
    
}