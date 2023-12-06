trigger RollupOrder on Order (after insert, after update, after delete, after undelete) {
    
    RollupOrderHandler.rollupOrder(Trigger.old, Trigger.new);  // Call Handler Method
}