public class RollupOrderLineHelper {
    
    public static void rollupOrderLine(list<OrderItem> OrderlineListOld,list<OrderItem> OrderlineListNew){
        
        Set<Id> orderIds = new Set<Id>();                              // Store Set of Order Id
        if(OrderlineListOld != null && OrderlineListOld.size() > 0) {
            for(OrderItem record: OrderlineListOld) {
                orderIds.add(record.OrderId);                          // Adding Ids to Set
            }
        }
        if(OrderlineListNew != null && OrderlineListNew.size() > 0) {
            for(OrderItem record: OrderlineListNew) {
                orderIds.add(record.OrderId);                         // Adding Ids to set
            }
        }
        if(OrderlineListNew.size() > 0){
            update [SELECT Id FROM Order WHERE Id IN :orderIds];     // Update Order
        }
    }
    
}