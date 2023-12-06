public class PracticeClass {
    public static void ListDemo(){
        List<string> namelist = new list<string> {'sachin','sheetal','krupali','nilesh','neeta','kalp','krishang'};
        namelist.add('Gaurav');
        namelist.add('parth');
        namelist.add('bhavini');
        
        system.debug('Name list :-' + namelist);
        
        for(string str : namelist){
            System.debug(str);
        }
        
        system.debug('list of size :-' + namelist.size());
        
        list<string> lstname = new list<string>();
        lstname.addAll(namelist);
        
        system.debug('new list size' + lstname.size());
    }
    
    public static void setdemo(){
        set<string> Nameset = new set<string>();
        Nameset.add('Gaurav');
        Nameset.add('Krupali');
        Nameset.add('Sachin');
        Nameset.add('Gaurav');
        Nameset.add('Nilesh Dholakiya');
        Nameset.add('Nilesh');
        Nameset.add('Nita');
        Nameset.add('Sheetal');
        Nameset.add('Akshay');
        Nameset.add('Robin ');
        
        system.debug('Set Contains' + Nameset);
        system.debug('size of set' + Nameset.size());
        System.debug('is contain Gaurav' + Nameset.contains('Gaurav'));
        Nameset.clear();
        system.debug('size of set ' + Nameset.size());
        System.debug('check set empty or not :-' + Nameset.isempty());
    }
    
    public static void mapdemo(){
        map<string, string> namemap = new map<string, string>();
        namemap.put('1','Gaurav');
        namemap.put('2','krupali');
        
        
    }

}