trigger SumOrders on Account (before update) {
    
    SumOrdersHandler.sumOrders(Trigger.new, Trigger.newmap); // Call Handler Method

}