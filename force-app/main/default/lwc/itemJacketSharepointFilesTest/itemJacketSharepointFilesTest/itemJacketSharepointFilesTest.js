import { LightningElement, wire, track, api } from "lwc";

import { loadScript } from "lightning/platformResourceLoader";
import {
  getRecord,
  getFieldValue,
  getRecordNotifyChange,
  updateRecord
} from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import {
  subscribe,
  unsubscribe,
  MessageContext,
  publish
} from "lightning/messageService";
import { subscribe as empSub, unsubscribe as empUnSub } from "lightning/empApi";
import { refreshApex } from "@salesforce/apex";

// LMS import
import SharePointToken from "@salesforce/messageChannel/sharepointToken__c";
import requestSharePointToken from "@salesforce/messageChannel/requestSharepointToken__c";

// Apex method imports
import GetAllDocumentsByJacket from "@salesforce/apex/ItemJacketSharePointFilesTestController.GetAllDocumentsByJacket";
import checkUserAccessforComponent from "@salesforce/apex/ItemJacketSharePointFilesTestController.checkUserAccessforComponent";
import getDocumentTypes from "@salesforce/apex/ItemJacketSharePointFilesTestController.getDocumentTypes";
import CheckforExistingFile from "@salesforce/apex/ItemJacketSharePointFilesTestController.CheckforExistingFile";
import handleDeleteDocument from "@salesforce/apex/ItemJacketSharePointFilesTestController.handleDeleteDocument";
import updateDocumentType from "@salesforce/apex/ItemJacketSharePointFilesTestController.updateDocumentType";

//import JQueryV60 from '@salesforce/resourceUrl/JQueryV60';

import Item_Jacket_Sharepoint_Site_Relative_Url from "@salesforce/label/c.Item_Jacket_Sharepoint_Site_Relative_Url";
import TenantURL from "@salesforce/label/c.SharePoint_Tenant_Url";

// Item Jacket fields
import ItemJacket_OBJECT from "@salesforce/schema/Item_Jacket__c";
import Id_Field from "@salesforce/schema/Item_Jacket__c.Id";
import Name_Field from "@salesforce/schema/Item_Jacket__c.Name";
import PlantId_Field from "@salesforce/schema/Item_Jacket__c.Plant_Id_Formula__c";
import CloningCompleted_Field from "@salesforce/schema/Item_Jacket__c.Cloning_Completed__c";

// User fields
import Author_Field from "@salesforce/schema/User.Email";
import USER_ID from "@salesforce/user/Id";
import Id from "@salesforce/schema/Account.Id";

const FIELDS = [Id_Field, Name_Field, PlantId_Field, CloningCompleted_Field];

export default class itemJacketSharePointFiles extends LightningElement {
  @api recordId;

  @track isDialogVisible = false;
  @track originalMessage;
  @track overwriteMessage;
  @track isConfirmDialogVisible = false;
  @track displayError = false;
  @track errorMessage = "";
  @api objectApiName = ItemJacket_OBJECT;

  @api showFilePropertiesModal = false;
  @api isCheckingFileExists = false;
  @api showDocumentPropertiesForm = false;

  @track selectedDocTypeFieldAPIName = "";
  @track selectedDocTypeLabel = "";
  //@track selectedDocType = '';
  @track options;
  @track showSpinner = false;
  showNoDocuments = false;

  showIsUploading = false;
  @api documentDetail = false;
  @api uploadedFilesResponse;
  token = "";

  // file upload values
  fileData;
  @api files = [];
  @track allDocuments = [];
  @api isFileExists = false;
  @api isFileUploadedFail = false;
  @api isFileUploaded = false;

  // html disply control values
  hasEditAccess = false;
  hasReadAccess = false;
  displayAccessMessage;
  showLoadingMessage = false;

  itemJacketName;
  itemjacket;
  @track fileTarget;
  email;
  plantId;
  fileContents;
  fileReader;
  content;
  jacketId;
  authenticationError;

  // fetch SharePoint document timers
  delayTimerConstant = 10000;
  delayTimer = 30000;
  delayInitial = 30000;

  oldDocSize;
  isOverwriteFile = false;
  overwriteFileName;
  overwriteFileTimestamp;

  // SharePoint auth subscription
  subscription;

  // Item Jacket Event subscription
  refreshSubscription;

  get acceptedFormats() {
    return [
      ".xlsx, .xls, .csv, .png, .doc, .docx, .pdf, .zip, .psd, .bin, .txt"
    ];
  }

  connectedCallback() {
    /* loadScript(this, JQueryV60)
            .then(() => {
                console.log('JQueryV60 loaded.');
            })
            .catch(error => {
                console.log('Failed to load the JQueryV60 : ' + error);
            });*/
    this.showLoadingMessage = true;

    // check for user's access for itemjacket (Read/Edit)
    checkUserAccessforComponent({ itemJacketId: this.recordId })
      .then((result) => {
        console.log("checkUserAccessforComponent : ", JSON.stringify(result));
        this.hasEditAccess = result.HasEditAccess;
        this.hasReadAccess = result.HasReadAccess;
      })
      .catch((error) => {
        this.displayAccessMessage = true;
        console.error(error);
      });
    this.fetchDocumentTypes();
  }

  //get Document type to select for
  fetchDocumentTypes() {
    getDocumentTypes({ sObjectName: this.objectApiName }).then((data) => {
      if (data) {
        let typeOptions = [];
        for (var key in data) {
          typeOptions.push({ label: data[key], value: key });
        }
        typeOptions.push({ label: "Other", value: "Other" });
        console.log(typeOptions);
        this.options = typeOptions;
      }
    });
  }

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  wiredRecord({ error, data }) {
    if (data) {
      this.itemjacket = data;
      this.itemJacketName = getFieldValue(data, Name_Field);
      this.plantId = getFieldValue(data, PlantId_Field);
      console.log("Item/Plant : ", this.itemJacketName, " : ", this.plantId);

      const messageCallback = (response) => {
        this.handleItemJacketEventResponse(response);
      };
      var CloningCompletedStatus = getFieldValue(
        this.itemjacket,
        CloningCompleted_Field
      );
      if (
        CloningCompletedStatus == "No" ||
        CloningCompletedStatus == "Processing"
      ) {
        empSub("/event/Item_Jacket_Event__e", -1, messageCallback).then(
          (response) => {
            console.log(
              "Subscription request sent to: ",
              JSON.stringify(response.channel)
            );
            this.refreshSubscription = response;
          }
        );
      } else {
        this.fetchDocumentsFromSP();
      }
      this.fetchDocumentsFromSP();
    }

    if (error) {
      console.log(error);
    }
  }

  handleItemJacketEventResponse(response) {
    let obj = JSON.parse(JSON.stringify(response));
    if (
      getFieldValue(this.itemjacket, Id_Field) ==
        obj.data.payload.RecordId__c &&
      obj.data.payload.Cloning_Completed__c
    ) {
      console.log("messageCallback if");
      this.handleUnsubscribe();
      this.fetchDocumentsFromSP();
    }
  }

  @wire(getRecord, { recordId: USER_ID, fields: [Author_Field] })
  wireuser({ error, data }) {
    if (error) {
      this.error = error;
    } else if (data) {
      this.email = getFieldValue(data, Author_Field);
      console.log(this.email);
    }
  }

  @wire(MessageContext)
  messageContext;

  subscribeToSharepointTokenChannel() {
    console.log("subscribing to Sharepoint Token Channel");
    if (!this.subscription) {
      this.subscription = subscribe(
        this.messageContext,
        SharePointToken,
        (message) => this.handleSharePointTokenReceived(message)
      );
    }
  }

  publishSharePointTokenRequest() {
    console.log("publishing empty token message to SharePointToken channel");
    publish(this.messageContext, requestSharePointToken, { token: this.token });
  }

  handleSharePointTokenReceived(message) {
    console.log(
      "handleSharePointTokenReceived called with " + JSON.stringify(message)
    );
    if (message.token && message.token != "Error") {
      console.log("inside valid token");
      //console.log(message.token.substring(0, 20) + '...');
      this.token = "Bearer " + message.token;

      // getFileBuffer
      this.fileReader = new FileReader();
      this.fileReader.onloadend = () => {
        console.log("inside the onloadend");
        this.fileContents = this.fileReader.result;
        this.handleUploadWithRESTAPI(this.token);
      };
      this.fileReader.onerror = () => {
        console.log("inside the onerror");
        console.log(this.fileReader.error);
        console.log(this.fileReader.state);
      };
      console.log("before arraybuffer read");
      console.log(this.fileReader);
      console.log(this.files);
      //try {
      this.fileReader.readAsArrayBuffer(this.files); //failing here
      //} catch (err) {
      //    console.log(err);
      //    console.log(JSON.stringify(err));
      //}
      console.log("after arraybuffer read");
    }
    if (message.token == "Error") {
      this.authenticationError =
        "Authentication Failed or User Cancelled Authentication Request or a pop-up window was blocked.";
      this.showSpinner = false;
    }
  }

  fetchDocumentsFromSP() {
    //get documents from sharepoint by making httpcallout from server
    GetAllDocumentsByJacket({
      folderName: getFieldValue(this.itemjacket, Name_Field),
      libraryName: getFieldValue(this.itemjacket, PlantId_Field),
      JacketId: this.recordId,
      hasEditAccess: this.hasEditAccess
    })
      .then((result) => {
        this.documentDetail = true;
        this.allDocuments = result;
        console.log("result", result);
        this.showSpinner = false;
        this.showLoadingMessage = false;
        if (this.allDocuments) {
          this.showNoDocuments = !(result.length > 0);
        } else {
          this.showNoDocuments = true;
        }
      })
      .catch((error) => {
        console.log("Error : " + JSON.stringify(error));
        this.showSpinner = false;
        this.showLoadingMessage = false;
      });
  }

  handleFileTypeSelectionChange(event) {
    this.selectedDocTypeFieldAPIName = event.detail.value;
    this.selectedDocTypeLabel = event.target.options.find(
      (opt) => opt.value === event.detail.value
    ).label;
  }

  handleFilesPropertiesModal() {
    this.showFilePropertiesModal = true;
    this.isCheckingFileExists = false;
    this.showDocumentPropertiesForm = true;
    this.showSpinner = false;
  }

  CheckifFileExistsinSPO() {
    var updatedFileName = this.files.name.replace(/'/g, "");
    // updatedFileName= encodeURIComponent(updatedFileName);
    console.log("updatedFileName : " + updatedFileName);

    CheckforExistingFile({
      recordId: this.recordId,
      libraryName: this.plantId,
      fileName: updatedFileName
    })
      .then((result) => {
        if (result != null || result != "") {
          //add additional check since it can fail in parsing if the server returns an error
          console.log(result);
          console.log("in file exist");
          this.isFileExists = JSON.parse(result).isFileExists;
          console.log(this.isFileExists);
          if (this.isFileExists == false) {
            this.handleFilesPropertiesModal();
          } else {
            //this.selectedDocTypeFieldAPIName == JSON.parse(result).documentType;
            console.log(JSON.parse(result).documentType);
            this.selectedDocTypeLabel = JSON.parse(result).documentType;
            this.isConfirmDialogVisible = true;
            this.showFilePropertiesModal = false;
            this.showSpinner = false;
          }
        }
      })
      .catch((error) => {
        console.log(error, "Error in checking for existing file in SPO");
      });
  }

  //Update Product Information selected by user from Document Type
  handleUpdateofItemJacket() {
    console.log("handleUpdateofItemJacket");
    console.log(this.selectedDocTypeFieldAPIName);
    console.log(Id_Field.fieldApiName);
    const fields = {};
    fields[Id_Field.fieldApiName] = this.recordId;
    fields[this.selectedDocTypeFieldAPIName] = "Yes";

    if (this.selectedDocTypeFieldAPIName != "Other") {
      updateRecord({ fields })
        .then((result) => {
          console.log(result);
          getRecordNotifyChange([{ recordId: this.recordId }]);
        })
        .catch((error) => {
          console.log(
            "Error in updating Structured Approved Doc " + JSON.stringify(error)
          );
          this.dispatchEvent(
            new ShowToastEvent({
              title: "Error!",
              message: "Error in updating Structured Approved Doc.",
              variant: "error"
            })
          );
        });
    }
  }

  handleOverwriteFile(event) {
    if (event.target.name === "openConfirmation") {
      //fetch record id to be deleted
      this.originalMessage = event.currentTarget.dataset.id;
      console.log("handleOverwriteFile Event", event);
      //shows the component
      this.isConfirmDialogVisible = true;
    } else if (event.target.name === "confirmModal") {
      //when user clicks outside of the dialog area, the event is dispatched with detail value  as 1
      if (event.detail !== 1) {
        //gets the detail message published by the child component
        let recordIdToBeDeleted = event.detail.originalMessage;
        console.log("recordIdToBeDeleted", recordIdToBeDeleted);
        console.log("event.detail.status", event.detail.status);
        if (event.detail.status === "Yes") {
          this.showSpinner = true;
          this.isCheckingFileExists = false;
          this.isOverwriteFile = true;
          this.overwriteFileName = this.files.name;
          this.subscribeToSharepointTokenChannel();
          this.publishSharePointTokenRequest();
        } else if (event.detail.status === "No") {
          console.log("cancel");
          this.isConfirmDialogVisible = false;
          this.handleCloseModal();
        }
      }
      //this.isConfirmDialogVisible = false;
    }
  }

  handledeleteFileFromSP(event) {
    if (event.currentTarget.name === "openConfirmation") {
      //fetch record id to be deleted
      this.originalMessage = event.currentTarget.dataset.id;

      //shows the component
      this.isDialogVisible = true;
    } else if (event.currentTarget.name === "confirmModal") {
      //when user clicks outside of the dialog area, the event is dispatched with detail value  as 1
      if (event.detail !== 1) {
        //gets the detail message published by the child component
        let recordIdToBeDeleted = event.detail.originalMessage;
        console.log("recordIdToBeDeleted", recordIdToBeDeleted);
        console.log("event.detail.status", event.detail.status);
        //you can do some custom logic here based on your scenario
        if (event.detail.status === "Yes") {
          this.showSpinner = true;
          handleDeleteDocument({
            libraryName: this.plantId,
            itemId: recordIdToBeDeleted
          })
            .then((responseData) => {
              console.log(responseData);
              /*if (!responseData.isSuccess) {
                                this.showSpinner = false;
                                this.isFileExists = false;
                                this.isFileUploaded = false;
                                this.isDialogVisible = false;
                                this.displayError = true;
                                this.errorMessage = 'Error while deleting a file from sharepoint.';
                                return;
                            }*/
              if (responseData && responseData.itemCount == 0) {
                updateDocumentType({
                  recordId: this.recordId,
                  documentType: responseData.documentType
                })
                  .then((response) => {
                    console.log("inside updateDocumentType");
                    getRecordNotifyChange([{ recordId: this.recordId }]);
                    console.log(response);
                  })
                  .catch((error) => {
                    console.error("Error:", error);
                  });
                this.dispatchEvent(
                  new ShowToastEvent({
                    title: "Success!",
                    message: "File deleted from Sharepoint.",
                    variant: "success"
                  })
                );
              } /*else {
                                console.log(responseData);
                                this.dispatchEvent(
                                    new ShowToastEvent({
                                        title: 'Error!',
                                        message: 'Error while deleting a file.',
                                        variant: 'error'
                                    }),
                                );
                            }*/

              this.fetchDocumentsFromSP();
              this.showSpinner = false;
              this.isDialogVisible = false;
              return refreshApex(this.allDocuments);
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        } else if (event.detail.status === "No") {
          console.log("cancel");
          this.isDialogVisible = false;
          //do something else
        }
      }

      //hides the component
      //this.isDialogVisible = false;
    }
  }

  handleCloseModal() {
    this.showFilePropertiesModal = false;
    this.token = "";
    this.files = undefined;
    this.isFileUploaded = false;
    this.authenticationError = "";
    this.displayError = false;
  }

  // Upload files to SP by clicking on Upload button
  handleFileUploadToSharePoint() {
    if (this.selectedDocTypeFieldAPIName != "") {
      this.showSpinner = true;
      this.authenticationError = "";
      this.subscribeToSharepointTokenChannel();
      this.publishSharePointTokenRequest();
    } else {
      alert("Please select Document type");
    }
  }

  handleCachedFile() {
    if (this.files) {
      this.fileData = new FormData();
      this.fileData.append("file", this.files);
      this.showFilePropertiesModal = true;
      this.isCheckingFileExists = true;
      this.showSpinner = true;
      this.CheckifFileExistsinSPO();
    }
  }

  //File handler after selecting docuemnt from local system
  selectFile(event) {
    var format = /["*:<>/|\\]/;
    /*var updatedFileName = event.target.files[0].name.replace(/'/g, '"');
        console.log("updatedFileName : "+updatedFileName);*/
    if (format.test(event.target.files[0].name)) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Error!",
          message:
            "File name contains special characters, please select a different file.",
          variant: "error"
        })
      );
    } else {
      console.log(event.target.files[0]);
      this.files = event.target.files[0];
      this.handleCachedFile();
      console.log("event.target.value", event.target.value);
      event.target.value = null;
      event = null;
    }
    var inputField = this.template.querySelectorAll("input");
    inputField.forEach((element) => {
      element.value = "";
    });
  }

  dragOverHandler(event) {
    event.preventDefault();
  }

  dropHandler(event) {
    event.preventDefault();
    if (event.dataTransfer.files) {
      this.files = event.dataTransfer.files[0];
    }
    this.handleCachedFile();
  }

  async handleUploadWithRESTAPI(token) {
    console.log("handleUploadWithRESTAPI");
    console.log("plantId", this.plantId);
    console.log("itemJacketName", this.itemJacketName);
    console.log(this.files);
    console.log(this.fileContents.byteLength);
    var updatedFileName = this.files.name.replace(/'/g, ""); //Commnted  by Zarana - //10/01/2021
    var updatedFileName = encodeURIComponent(updatedFileName);
    console.log("updatedFileName : " + updatedFileName);

    //  var url1 = Item_Jacket_Sharepoint_Site_Relative_Url + "/_api/web/GetFolderByServerRelativeUrl('" + TenantURL + "/Drop Off Library')/Files/add(overwrite=true,url='" + this.files.name + "')";
    //var url1 = TenantURL + Item_Jacket_Sharepoint_Site_Relative_Url + "/_api/web/GetFolderByServerRelativeUrl('" + Item_Jacket_Sharepoint_Site_Relative_Url + "/Drop Off Library')/Files/add(overwrite=true,url='" + encodedFileName + "')";
    var url1 =
      TenantURL +
      Item_Jacket_Sharepoint_Site_Relative_Url +
      "/_api/web/GetFolderByServerRelativePath(decodedurl='" +
      Item_Jacket_Sharepoint_Site_Relative_Url +
      "/Drop Off Library')/Files/AddUsingPath(overwrite=true,decodedurl='" +
      updatedFileName +
      "')";

    console.log("handleUploadWithRESTAPI", url1);

    //const siteUrlnew = Item_Jacket_Sharepoint_Site_Relative_Url + '/_api/contextinfo';
    const siteUrlnew =
      TenantURL +
      Item_Jacket_Sharepoint_Site_Relative_Url +
      "/_api/contextinfo";
    console.log("siteUrlnew", siteUrlnew);
    try {
      await fetch(siteUrlnew, {
        method: "POST",
        processData: false,
        mode: "cors",
        contentType: false,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: token,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache",
          pragma: "no-cache"
        }
      })
        .then((r) => r.json())
        .then((digestValue) => {
          console.log("Digest=>", digestValue);
          if (digestValue["odata.error"]) {
            console.log(digestValue["odata.error"].message.value);
            this.isFileExists = false;
            this.showSpinner = false;
            this.isFileUploaded = false;
            this.displayError = true;
            this.errorMessage = "";
            return;
          }
          fetch(url1, {
            method: "POST",
            headers: {
              "X-RequestDigest": digestValue.FormDigestValue,
              Accept: "application/json; odata=verbose",
              "content-length": this.fileContents.byteLength,
              "content-type": "application/json;odata=verbose",
              Authorization: token
            },
            body: this.fileContents
          })
            .then((attchResult) => {
              console.log("File uploaded", attchResult);
              this.GetDocumentIDByServerUrl(attchResult.url, token)
                .then((itm) => {
                  console.log(itm);

                  this.UpdateFileMetaData(
                    itm.Id,
                    {
                      PlantIdFormula: this.plantId,
                      ItemJacketName: this.itemJacketName,
                      RecordID: this.recordId,
                      DocumentType: this.selectedDocTypeLabel
                    },
                    digestValue.FormDigestValue,
                    token
                  )
                    .then((f) => {
                      console.log(f);
                      this.authenticationError = "";
                      if (!this.isOverwriteFile) {
                        this.handleUpdateofItemJacket();
                      }
                      this.showSpinner = false;
                      this.showFilePropertiesModal = false;
                      this.isFileUploaded = true;
                      this.showDocumentPropertiesForm = false;
                      this.isConfirmDialogVisible = false;
                      this.files = null;
                    })
                    .catch((error) => {
                      console.log(
                        "File uploaded successfully but metadata is not updated.",
                        error
                      );
                      this.isFileExists = false;
                      this.showSpinner = false;
                      this.isFileUploaded = false;
                      this.displayError = true;
                      this.errorMessage =
                        "File uploaded successfully but metadata is not updated.";
                      throw error;
                    });
                })
                .catch((error) => {
                  console.log("Error in GetDocumentIDByServerUrl");
                  this.isFileExists = false;
                  this.showSpinner = false;
                  this.isFileUploaded = false;
                  this.displayError = true;
                  this.errorMessage = "Error in GetDocumentIDByServerUrl.";
                  throw error;
                });
            })
            .catch((error) => {
              console.log("Error in File Upload.", error);
              this.isFileExists = false;
              this.displayError = true;
              this.errorMessage = "Error in File Upload.";
              this.showSpinner = false;
              this.isFileUploadedFail = true;
              this.isFileUploaded = false;
              throw error;
            });
        })
        .catch((error) => {
          console.log("Error while getting digest value.", error);
          this.isFileExists = false;
          this.showSpinner = false;
          this.isFileUploaded = false;
          this.displayError = true;
          this.errorMessage = "Error while getting digest value.";
          throw error;
        });

      // after await
      this.showIsUploading = true;
      this.isValidLinks = false;
      this.showNoDocuments = false;
      if (this.oldDocSize) {
        this.oldDocSize++;
        console.log("IF oldDocSize", this.oldDocSize);
        this.attemptUploadAndUpdate();
        // two or more running at the same time if more than one doc is uploaded
      } else {
        this.oldDocSize = this.allDocuments ? this.allDocuments.length : 0;
        console.log("ELSE oldDocSize", this.oldDocSize);
        this.attemptUploadAndUpdate();
      }
    } catch (error) {
      console.error("Error:", error);
      this.showSpinner = false;
      this.isFileUploadedFail = true;
      this.isFileUploaded = false;
    }
  }

  GetDocumentIDByServerUrl(fileRef, token) {
    var updatedFileName = this.files.name.replace(/'/g, ""); //Commnented by zarana 10/01/2021
    var updatedFileName = encodeURIComponent(updatedFileName);
    console.log("updatedFileName : " + updatedFileName);
    //var reqUrl = TenantURL + Item_Jacket_Sharepoint_Site_Relative_Url + `/_api/Lists/GetBytitle('Drop Off Library')/items?$filter=FileRef eq '${encodedFileName}'`;
    var reqUrl =
      TenantURL +
      Item_Jacket_Sharepoint_Site_Relative_Url +
      `/_api/web/GetFileByServerRelativePath(decodedurl='` +
      Item_Jacket_Sharepoint_Site_Relative_Url +
      `/Drop Off Library/${updatedFileName}')/ListItemAllFields`;

    console.log(reqUrl);

    return fetch(reqUrl, {
      method: "GET",
      headers: {
        Authorization: token,
        accept: "application/json;odata=nometadata"
      }
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        return data;
      })
      .catch((error) => {
        console.log(error);
        this.showSpinner = false;
        this.isFileExists = false;
        this.isFileUploaded = false;
        this.displayError = true;
        this.errorMessage = "Error in GetDocumentIDByServerUrl.";
      });
  }

  UpdateFileMetaData(ItemId, metaData, digest, token) {
    console.log(metaData);
    // return fetch(`${Item_Jacket_Sharepoint_Site_Relative_Url}/_api/Lists/GetByTitle('Drop Off Library')/items(${ItemId})`,
    return fetch(
      `${
        TenantURL + Item_Jacket_Sharepoint_Site_Relative_Url
      }/_api/Lists/GetByTitle('Drop Off Library')/items(${ItemId})`,
      {
        method: "POST",
        headers: {
          accept: "application/json;odata=nometadata",
          Authorization: token,
          "Content-Type": "application/json;odata=nometadata",
          "X-RequestDigest": digest,
          "IF-MATCH": "*",
          "X-HTTP-Method": "MERGE"
        },
        body: JSON.stringify(metaData)
      }
    );
  }

  attemptUploadAndUpdate() {
    GetAllDocumentsByJacket({
      folderName: this.itemJacketName,
      libraryName: this.plantId,
      JacketId: this.recordId,
      hasEditAccess: this.hasEditAccess
    })
      .then((result) => {
        console.log("================");
        this.documentDetail = true;
        this.allDocuments = result;

        let hasInvalidLinks = false;

        if (result) {
          result.every((doc) => {
            console.log("doc", doc);
            if (!doc.fileLink) {
              hasInvalidLinks = true;
              return false;
            }
            return true;
          });
          console.log("hasInvalidLinks", hasInvalidLinks);
        }
        let delayAndRunAgain = false;
        let reset = false;
        console.log(result);
        console.log("result above, JSON magic below");
        console.log(JSON.parse(JSON.stringify(this.allDocuments)));
        console.log("oldDocSize", this.oldDocSize);
        let uploadPending = this.allDocuments.length <= this.oldDocSize;
        console.log("this.allDocuments.length", this.allDocuments.length);

        if (uploadPending && !this.isOverwriteFile) {
          console.log("IF > Length has not changed");
          delayAndRunAgain = true;
        } else if (hasInvalidLinks) {
          console.log("ELSE IF > Checking all links");
          delayAndRunAgain = true;
        } else {
          console.log("ELSE > Refresh");
          reset = true;
        }

        if (this.isOverwriteFile && 0) {
          // to-do: once time is added to the Modified this can have the && 0 removed
          let overwriteDoc = this.allDocuments.filter(
            (doc) => doc.Name == this.overwriteFileName
          );
          this.overwriteFileTimestamp =
            this.overwriteFileTimestamp == undefined
              ? overwriteDoc.Modified
              : this.overwriteFileTimestamp;
          if (this.overwriteFileTimestamp == overwriteDoc.Modified) {
            delayAndRunAgain = true;
          } else {
            console.log("final");
            reset = true;
          }
        }

        if (delayAndRunAgain) {
          setTimeout(() => this.attemptUploadAndUpdate(), this.delayTimer);
          this.delayTimer = this.delayTimerConstant;
        }

        if (reset) {
          this.delayTimer = this.delayInitial;
          this.showIsUploading = false;
          this.oldDocSize = undefined;
          this.isOverwriteFile = false;
          if (this.allDocuments) this.showNoDocuments = false;
          else this.showNoDocuments = true;
          refreshApex(this.allDocuments);
        }
      })
      .catch((error) => {
        console.log("Error : " + JSON.stringify(error.message));
        this.delayTimer = this.delayInitial;
        this.showIsUploading = false;
        this.oldDocSize = undefined;
        this.isOverwriteFile = false;
        if (this.allDocuments) this.showNoDocuments = false;
        else this.showNoDocuments = true;
      });
  }

  hasInvalidLinks(result) {
    let hasInvalidLinks = false;
    result.every((doc) => {
      console.log("doc", doc);
      if (!doc.fileLink) {
        hasInvalidLinks = true;
        return false;
      }
      return true;
    });
    console.log("hasInvalidLinks", hasInvalidLinks);
    return hasInvalidLinks;
  }

  handleUnsubscribe() {
    if (this.refreshSubscription) {
      empUnSub(this.refreshSubscription, (response) => {
        console.log("unsubscribe() response: " + JSON.stringify(response));
      });
      this.refreshSubscription = null;
    }
  }

  disconnectedCallback() {
    this.handleUnsubscribe();
    if (this.subscription) {
      unsubscribe(this.subscription);
      this.subscription = null;
    }
  }
}
