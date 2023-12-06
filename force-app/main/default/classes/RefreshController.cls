public class RefreshController {
    
    public Boolean isRefresh;
    
    public void RefreshController(){
       this.isRefresh = false; 
    }
    
    @AuraEnabled
    public Boolean getIsrefreshget(){
        return this.isRefresh;
    }
    
    @AuraEnabled
    public void getcheckIsrefresh(){
        this.isRefresh = true;
    }
    

}