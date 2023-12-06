public inherited sharing class GenericController {
	@AuraEnabled
    public static list<ContentVersion> returnFiles(list<String> lstFileIds){
        return [SELECT Id,Title,DocumentType__c FROM ContentVersion WHERE Id IN :lstFileIds];
    }

    @AuraEnabled
    public static list<Id> saveFiles(list<Object> filesToInsert){
        
        list<Id> lstCntVerIds = new list<Id>();
        List<ContentVersion> lstVersionsToInsert = new List<ContentVersion>();
        for (Object file : filesToInsert) {
            FileInfo fileData = (FileInfo)JSON.deserialize(JSON.serialize(file), FileInfo.class);
            system.debug(fileData);
            ContentVersion objCntVersion = new ContentVersion();
            objCntVersion.PathOnClient = fileData.Title;
            objCntVersion.Title = fileData.Title;
            objCntVersion.VersionData = fileData.VersionData;
            system.debug(fileData.DocumentType);
            objCntVersion.DocumentType__c = fileData.DocumentType;
            lstVersionsToInsert.add(objCntVersion);
        }

        list<Database.saveResult> res = Database.insert(lstVersionsToInsert);
        for (Database.SaveResult saveResult : res) {
            if(saveResult.isSuccess()) {
                lstCntVerIds.add(saveResult.getId());
            }
        }
        return lstCntVerIds;
    }


    public class FileInfo {
        public String Title;
        public Blob VersionData;
        public string DocumentType;
    }
}