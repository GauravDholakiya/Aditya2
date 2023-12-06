public class stringtest {
    public void stringcheck(){
        string str = [select All_Emails__c from Account where id ='0012x00000JpoweAAB'].All_Emails__c;
        system.debug(str);
        list<string> stsplit = str.split(';');
        for(string st : stsplit){
            system.debug(st);
        }
        string demo = string.join(stsplit,';');
        system.debug(demo);
        if(stsplit.contains('jkl@gmail.com')){
            stsplit.remove(stsplit.indexOf('jkl@gmail.com'));
        }
        system.debug(stsplit);
    }

}