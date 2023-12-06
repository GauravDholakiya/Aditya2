@isTest
public class UserBachTest {
    
@isTest
    public static void UserBatchTestMethod(){
        UserRole r = new UserRole(DeveloperName = 'Testrole', Name = 'Test role');
        insert r;
        
        User u = new User(
     ProfileId = [SELECT Id FROM Profile WHERE Name = 'Standard User'].Id,
     LastName = 'last',
     Email = 'Test@Test12.com',
     Username = 'Test@Test12.com' + System.currentTimeMillis(),
     CompanyName = 'TEST',
     Title = 'title',
     Alias = 'alias',
     TimeZoneSidKey = 'America/Los_Angeles',
     EmailEncodingKey = 'UTF-8',
     LanguageLocaleKey = 'en_US',
     LocaleSidKey = 'en_US',
     Terminated_Date__c= system.today() - 2,            
     UserRoleId = r.Id
);   
        insert u;
        Test.startTest();
        ScheduleUserBatch job = new ScheduleUserBatch();
		String sch = '0 0 10,22 * * ?';
		system.schedule('User Batch schedule job Test', sch, job);
        Test.stopTest();
    }
}