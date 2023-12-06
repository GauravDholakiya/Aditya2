import { LightningElement, api, track, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import uploadFiles from "@salesforce/apex/multiplefile.uploadFiles";
import getFiles from "@salesforce/apex/multiplefile.getFiles";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import ContentVersion_OBJECT from "@salesforce/schema/ContentVersion";
import DocumentType_FIELD from "@salesforce/schema/ContentVersion.Document_Type__c";
import { refreshApex } from "@salesforce/apex";
import SystemModstamp from "@salesforce/schema/Account.SystemModstamp";
const MAX_FILE_SIZE = 2097152;
export default class Uploadfile extends LightningElement {
  // let obj ={};
  @api recordId;
  @track filesData = [];
  @track fileinsert = [];
  @track combo = [];
  @track alldata = [];
  @track check = false;
  showSpinner = false;
  @track selectedDocTypeLabel = "";
  test;
  @track columns = [
    {
      label: "Title",
      fieldName: "Title",
      type: "url",
      typeAttributes: {
        label: {
          fieldName: "_ContentDocumentId"
        },

        target: "_self"
      }
    },
    {
      label: "FileType",
      fieldName: "FileType",
      type: "Text",
      sortable: true
    },
    {
      label: "Document Type",
      fieldName: "Document_Type__c",
      type: "Text",
      sortable: true
    }
  ];

  @track filelist;
  filename;
  filetype;
  Documenttype;
  value;
  refresh;
  @track wiredAccountList = [];

  @wire(getFiles, { accid: "$recordId" })
  wiredAccounts(value) {
    this.wiredActivities = value;

    const { data } = value;
    if (data) {
      //console.log('test8',accid);
      this.filelist = data;

      console.log("viraj1", this.filelist);
    }
  }

  //this.wiredAccountList = data;
  // this.refresh = data;
  //console.log(this.refresh)

  @wire(getObjectInfo, { objectApiName: ContentVersion_OBJECT })
  ContentVersionMetadata;
  @wire(getPicklistValues, {
    recordTypeId: "$ContentVersionMetadata.data.defaultRecordTypeId",
    fieldApiName: DocumentType_FIELD
  })
  documentTypelist;

  handleFileUploaded(event) {
    if (event.target.files.length > 0) {
      let j = 0;
      for (var i = 0; i < event.target.files.length; i++) {
        /* if (event.target.files[i].size > MAX_FILE_SIZE) {
                    this.showToast('Error!', 'error', 'File size exceeded the upload size limit.');
                    return;
                }*/
        let file = event.target.files[i];
        let reader = new FileReader();
        console.log("this is i", i);

        //console.log(file)
        reader.onload = (e) => {
          console.log("onload this is i", j);
          var fileContents = reader.result.split(",")[1];
          this.filesData.push({
            fileName: file.name,
            fileContent: fileContents,
            id: j
          });
          //this.alldata.push({'fileName':file.name, 'fileContent':fileContents});
          //this.test = this.filesData;
          //console.log(this.test);
          console.log("onload", this.filesData);
          j = j + 1;
          // console.log('onload')
        };
        reader.readAsDataURL(file);
        this.check = true;
        console.log("test" + this.filesData);
      }
    }
  }

  uploadFiles() {
    /*  this.filesData.map(c => {
            this.combo.map(i =>{
                var documentType = i.documentType;
                this.alldata.push({...c,documentType})
            })
        });*/

    this.alldata = this.filesData.map((f) => {
      const com = this.combo.find(
        (documentType) => parseInt(documentType.id) === parseInt(f.id)
      );
      f.documentType = com ? com.documentType : null;

      return f;
    });
    console.log("alldata", this.filesData);
    console.log(this.alldata);

    if (this.alldata == [] || this.alldata.length == 0) {
      this.showToast("Error", "error", "Please select files first");
      return;
    }
    this.showSpinner = true;

    uploadFiles({
      recordId: this.recordId,
      filedata: JSON.stringify(this.alldata)
    })
      .then((result) => {
        console.log("lo", result);

        console.log("ff", this.filelist);

        if (result && result == "success") {
          //refreshApex(this.wiredAccountList);
          this.alldata = [];

          this.showToast("Success", "success", "Files Uploaded successfully.");

          // this.getFilesData(this.data);
        } else {
          throw "Error occur";
          //this.showToast('Error', 'error', result);
        }
        //return refreshApex(this.refresh);
      })
      .catch((error) => {
        if (error && error.body && error.body.message) {
          this.showToast("Error", "error", error.body.message);
        }
      })
      .finally(() => (this.showSpinner = false));

    this.check = false;

    var fields = {
      Title: this.filename,
      Document_Type__c: this.Documenttype,
      FileType: this.filetype
    };
    var objRecordInput = { apiName: "ContentVerison", fields };

    createRecord(objRecordInput)
      .then((response) => {
        alert("Account created with Id: " + response.id);
      })
      .catch((error) => {
        alert("Error: " + JSON.stringify(error));
      });
  }

  removeReceiptImage(event) {
    var index = event.currentTarget.dataset.id;
    this.alldata.splice(index, 1);
  }

  showToast(title, variant, message) {
    refreshApex(this.wiredActivities);
    //console.log('fsf',wiredAccountList)
    this.dispatchEvent(
      new ShowToastEvent({
        title: title,
        variant: variant,
        message: message
      })
    );
    //refreshApex(this.refresh);
  }

  handleCloseModal() {
    this.showFilePropertiesModal = false;
    //this.token = '';
    this.files = undefined;
    this.isFileUploaded = false;
    this.authenticationError = "";
    this.displayError = false;
    this.check = false;
  }

  handleFileTypeSelectionChange(event) {
    // console.log(this.filesData)
    console.log("abc", event.detail.value);
    7; // this.value = event.detail.value;
    // console.log('ff',this.value);
    //this.selectedDocTypeLabel = JSON.parse(result).documentType;
    //this.Documenttype = event.target.documentTypelist.data.values.find(opt => opt.value === event.detail.value).label;
    //this.test = this.value;

    // this.filesData.documentType = this.value;
    this.fileinsert.push({ documentType: event.detail.value });

    this.combo.push({
      id: event.target.id.substr(0, 1),
      documentType: event.detail.value
    });

    console.log("combo", this.combo);

    console.log("cde", this.fileinsert[0].documentType);
    console.log("this is fileinserted");
    console.log(this.filesData);
    console.log("this is fileinserted");

    //console.log('me',this.data)
  }
}
