import { LightningElement, api, track, wire } from "lwc";
import saveFiles from "@salesforce/apex/multiplefile.saveFiles";
import getFiles from "@salesforce/apex/multiplefile.returnFiles";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import ContentVersion_OBJECT from "@salesforce/schema/ContentVersion";
import DocumentType_FIELD from "@salesforce/schema/ContentVersion.DocumentType__c";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import FORM_FACTOR from "@salesforce/client/formFactor";
const columns = [
  {
    label: "Title",
    fieldName: "Title",
    type: "url",
    typeAttributes: {
      label: {
        fieldName: "Title"
      },
      target: "_blank"
    }
  },

  { label: "Document Type", fieldName: "DocumentType__c", type: "text" }
];

export default class MultipleFileUpload extends LightningElement {
  showLoadingSpinner = false;
  @api recordId;
  @track fileNames = "";
  @track filesUploaded = [];
  @track fileInsert = [];
  @track combodata = [];
  @track alldata = [];
  @track columns = columns;
  @track showFilePropertiesModal = false;
  @track docvalue = "";
  @track comboid = "";
  @wire(getObjectInfo, { objectApiName: ContentVersion_OBJECT })
  ContentVersionMetadata;
  @wire(
    getPicklistValues,

    {
      recordTypeId: "$ContentVersionMetadata.data.defaultRecordTypeId",

      fieldApiName: DocumentType_FIELD
    }
  )
  documentTypelist;
  @wire(getFiles, { RecordId: "$recordId" })
  filedata;

  // eslint-disable-next-line getter-return
  get isDesktop() {
    return FORM_FACTOR === "Large";
  }

  handleFileChanges(event) {
    let files = event.target.files;

    if (files.length > 0) {
      let filesName = "";

      for (let i = 0; i < files.length; i++) {
        let file = files[i];

        filesName = filesName + file.name + ",";

        let freader = new FileReader();
        freader.onload = (f) => {
          let base64 = "base64,";
          let content = freader.result.indexOf(base64) + base64.length;
          let fileContents = freader.result.substring(content);
          this.filesUploaded.push({
            id: i,
            Title: file.name,
            VersionData: fileContents
          });
        };

        freader.readAsDataURL(file);
      }

      this.fileNames = filesName.slice(0, -1);
      this.showFilePropertiesModal = true;
    }
  }

  handleCloseModal() {
    this.showFilePropertiesModal = false;
  }
  handleSaveFiles() {
    this.showLoadingSpinner = true;
    console.log(this.filesUploaded);
    this.fileInsert = this.filesUploaded.map((file) => {
      const documentsItem = this.combodata.find(
        (DocumentType) => parseInt(DocumentType.id) === parseInt(file.id, 10)
      );

      file.DocumentType = documentsItem ? documentsItem.DocumentType : null;

      return file;
    });

    console.log("file_Insert", this.fileInsert);
    saveFiles({
      recordId: this.recordId,
      filesToInsert: JSON.stringify(this.fileInsert)
    })
      .then((data) => {
        this.showLoadingSpinner = false;
        const showSuccess = new ShowToastEvent({
          title: "Success!!",
          message: this.fileNames + " files uploaded successfully.",
          variant: "Success"
        });
        refreshApex(this.filedata);
        this.dispatchEvent(showSuccess);
        //this.getFilesData(data);
        this.fileNames = undefined;
        this.filesUploaded = [];
        this.combodata = [];
        this.fileInsert = [];
        this.showFilePropertiesModal = false;
      })
      .catch((error) => {
        const showError = new ShowToastEvent({
          title: "Error!!",
          message: "An Error occur while uploading the file.",
          variant: "error"
        });
        this.dispatchEvent(showError);
      });
  }
  handleFileTypeSelectionChange(event) {
    console.log("this is an event", event);
    console.log(this.arr);
    console.log("above is array");
    console.log(this.filesUploaded);
    console.log("you r in change drop");
    if (this.combodata.includes("id : event.target.id.substr(0,1)")) {
      console.log("hello you are in if ");
    }

    this.combodata.push({
      id: event.target.id.substr(0, 1),
      DocumentType: event.detail.value
    });
  }
}
