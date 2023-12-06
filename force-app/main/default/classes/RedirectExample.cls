public class RedirectExample {
    public RedirectExample(){
        
    }
public pageReference redirect() {
        PageReference pageRef = new PageReference('http://www.google.com');
        pageRef.setRedirect(true);
        return pageRef;
    }  
}