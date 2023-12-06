import { LightningElement , track} from 'lwc';

export default class RichTextExample extends LightningElement {
    @track textValue;
    @track userValue;
    @track userOrigin;
    @track IsShowUser;

    formats = [
        'font',
        'size',
        'bold',
        'italic',
        'underline',
        'strike',
        'list',
        'indent',
        'align',
        'clean',
        'table',
        'header',
        'color',
    ];

    handleChange(event) {
        this.textValue = event.target.value;


        //this.textValue = this.textValue + 'Salesforce User';
        //console.log(event.target.keycode());
    }
    keyCheck(event){
        console.log(event.which);
        if(event.which === 32){
            this.checkUser();
        }

    }
    handleClick() {

        this.tempStr = this.textValue.split("@").toString();
        this.repStr = this.tempStr.replace( /(<([^>]+)>)/ig, '');
        this.userValue = this.repStr.replace(',','');
      
        console.log(this.userValue);
        if(this.userValue.toLowerCase() === "Gaurav".toLowerCase()){
            this.userOrigin = "Salesforce User";
        }
        else if(this.userValue.toLowerCase() === "Zarana".toLowerCase()){
            this.userOrigin ="SharePoint User";
        }
        else{
            this.userOrigin ="Other User"
        }

        this.IsShowUser = true; 

    }

    checkUser(){
        this.tempStr = this.textValue.split("@").toString();
        this.repStr = this.tempStr.replace( /(<([^>]+)>)/ig, '');
        this.userValue = this.repStr.replace(',','');
      
        console.log(this.userValue);
        if(this.userValue.toLowerCase() === "Gaurav".toLowerCase()){
            this.userOrigin = "Salesforce User";
        }
        else if(this.userValue.toLowerCase() === "Zarana".toLowerCase()){
            this.userOrigin ="SharePoint User";
        }
        else{
            this.userOrigin ="Other User"
        }

        this.IsShowUser = true; 

    }
}