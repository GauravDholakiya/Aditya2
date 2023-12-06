public class Practicefor {
    public static void Fordemo(){
        for(integer i=0;i<10;i++){
        system.debug('You are in Method:- for Demo i is:-' +i);
        }
    }
    
    public static void listfordemo(){
        list<string> name = new list<string> {'gaurav','sachin','shivam','krupali','sheetal','nilesh'};
            for(string st : name){
                system.debug('Name is:-' +st);
            }
    }
    
    public static void soqlfordemo(){
        for(Account acc : [select id,Name from Account limit 10]){
            system.debug('Account Name:-'+acc.Name + 'Account id :-' +acc.id);
        }
    }

}