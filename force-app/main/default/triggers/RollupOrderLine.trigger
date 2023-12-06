trigger RollupOrderLine on OrderItem (after insert, after update, after delete, after undelete) {
    
    RollupOrderLineHelper.rollupOrderLine(Trigger.old,Trigger.new);  //Call Handler Method
    
}