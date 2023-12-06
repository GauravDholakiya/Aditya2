global class ScheduleUserBatch implements Schedulable {
   global void execute(SchedulableContext sc) {
      UserBatch b = new UserBatch(); 
      Database.executeBatch(b);
   }
}