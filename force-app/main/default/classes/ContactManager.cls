@RestResource(urlMapping='/Contacts/*')
global class ContactManager {
    @HttpGet
    global static Contact getContactById() {
        RestRequest request = RestContext.request;
        
        String ContactId = request.requestURI.substring(
          request.requestURI.lastIndexOf('/')+1);
        Contact result =  [SELECT Id,Name,Email
                      FROM Contact
                        WHERE Id = :ContactId];
        return result;
    }
    @HttpPost
    global static Id insertRecord(string Firstname,string lastname,string email) {
         Contact thisContact = new Contact(
            Firstname=Firstname,
            lastname=lastname,
            email=email
           );
        insert thisContact;
        return thisContact.Id;
    }
    
}