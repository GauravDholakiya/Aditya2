/*
* Name :- Gaurav Dholakiya
* Api Name :- Dynamic Get record
* Use :- By giving Sobject name as a perameter. It will give you a records of that Sobject
*/
public class DynamicGetrecord {
    
    public static void getObjectRecords(String ObjName){
        String listType = 'List<' + ObjName + '>';
        List<Object> Resultlst = (List<Object>)Type.forName(listType).newInstance();
        String query = 'Select ';
        List<String> fields = new List<String>();
        Map<String , Schema.SObjectType> globalDescript = Schema.getGlobalDescribe();
        Schema.sObjectType objectTypess = globalDescript.get(ObjName); 
        Schema.DescribeSObjectResult ros1 = objectTypess.getDescribe(); 
        
        Map<String , Schema.SObjectField> mapFieldLists = ros1.fields.getMap(); 
        list<string> newfields = new list<string>();
        for(Schema.SObjectField field : mapFieldLists.values())  {  
            Schema.DescribeFieldResult fieldResultss = field.getDescribe();  
            
            if(fieldResultss.isAccessible())  {  
                newfields.add(fieldResultss.getName());
            }  
        }
        List<String> str = new List<String>();
        for(String fstr : newfields){
            str.add(fstr);
            //str.sort();
        } 
        
        string queryfields = string.join(str, ',');
        query =query+queryfields+' from '+ObjName+' limit 10';
        system.debug(query);
        Resultlst = database.query(query);
        
        System.debug(Resultlst);
    }
    
}