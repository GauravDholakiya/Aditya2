global class multiplefile
{  
    @AuraEnabled(cacheable=true)
    public static list<ContentVersion> returnFiles(string RecordId){
       
        List<ContentDocumentLink> ConDocLink =  [SELECT ContentDocumentId FROM ContentDocumentLink where LinkedEntityId =: RecordId];
        list<ID> ConDocId = new list<ID>();
        For(Sobject s : ConDocLink){
            ConDocId.add((id)s.get('ContentDocumentId'));
        }
        system.debug([select Id,Title,FileType,DocumentType__c,ContentDocumentId FROM ContentVersion where ContentDocumentId in :ConDocId]);
        return [select Id,Title,FileType,DocumentType__c,ContentDocumentId FROM ContentVersion where ContentDocumentId in :ConDocId];
       
    }
    
    @AuraEnabled
    global static String saveFiles(String recordId, String filesToInsert) {
      
        try {
            if(String.isNotBlank(filesToInsert)) {
                List<FileInfo> files = (List<FileInfo>) JSON.deserialize(filesToInsert, List<FileInfo>.class);
                System.debug(files);

                List<ContentVersion> ConVerLst = new List<ContentVersion>();
                for(FileInfo file : files) {       
                    ContentVersion objCntVersion = new ContentVersion();
                    objCntVersion.PathOnClient = file.Title;
                    objCntVersion.Title = file.Title;
                    objCntVersion.VersionData = file.VersionData;
                    system.debug(file.DocumentType);
                    objCntVersion.DocumentType__c = file.DocumentType;
                    ConVerLst.add(objCntVersion);
                }
                Insert ConVerLst;

                List<ContentDocumentLink> ConDocList = new List<ContentDocumentLink>();
                for(ContentVersion cv : [SELECT ContentDocumentId FROM ContentVersion WHERE Id =: ConVerLst]) {
                    ContentDocumentLink conDocLink = New ContentDocumentLink();
                    conDocLink.LinkedEntityId = recordId;
                    conDocLink.ContentDocumentId = cv.ContentDocumentId;
                    conDocLink.Visibility = 'AllUsers';
                    conDocLink.shareType = 'V';
                    ConDocList.add(conDocLink);
                    system.debug(ConDocList);
                }
                Insert ConDocList;        
            } else {
                return 'record Id is Blank';
            }
            return 'success';
        } catch (Exception ex) {
            System.debug(ex.getMessage() + ' -> ' + ex.getStackTraceString());
            throw new AuraHandledException(ex.getMessage());
        }
    }

    public class FileInfo {
        public String Title;
        public Blob VersionData;
        public string DocumentType;
    }

}