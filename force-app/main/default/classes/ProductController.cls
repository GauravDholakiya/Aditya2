public with sharing class ProductController {
    
    @AuraEnabled (cacheable=true)
    public static List<string> getProductType(){
        List<String> ProductTypelst = new list<string>();
        Set<String> ProductTypeset = new set<String>();
        List<Product__c> Productlst = [Select id,Product_Type__c  From Product__c];
        
        For(integer i=0;i<Productlst.size();i++){
            ProductTypeset.add(Productlst[i].Product_Type__c);
        }
        
        ProductTypelst.addAll(ProductTypeset);
        system.debug('productTypelst'+ProductTypelst);
        return ProductTypelst;
    }
    
    @AuraEnabled (cacheable=true)
    public static List<string> getProductCategory(){
        List<String> ProductCategorylst = new list<string>();
        Set<String> ProductCategoryset = new set<String>();
        List<Product__c> Productlst = [Select id,Product_Category__c  From Product__c];
        
        For(integer i=0;i<Productlst.size();i++){
            ProductCategoryset.add(Productlst[i].Product_Category__c);
        }
        
        ProductCategorylst.addAll(ProductCategoryset);
        system.debug('ProductCategorylst'+ProductCategorylst);
        return ProductCategorylst;
    }
}