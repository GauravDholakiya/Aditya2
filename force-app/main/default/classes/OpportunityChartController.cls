public class OpportunityChartController {
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getOpportunities(){
        return [SELECT Amount,Name,StageName FROM Opportunity WHERE StageName = 'Closed Won' ORDER BY CreatedDate ASC LIMIT 10];
    }
}