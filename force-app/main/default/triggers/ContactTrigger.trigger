trigger ContactTrigger on Contact (before insert,before update) {
    
    for(Contact con : Trigger.new){
        if(con.LastName == 'Techila'){
            con.adderror('you choosen Techila As Company Name ');
        }
    }

}