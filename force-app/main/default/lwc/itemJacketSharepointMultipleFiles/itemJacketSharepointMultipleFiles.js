import { LightningElement, wire, track, api } from "lwc";

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
import getAllDocumentsByJacket from "@salesforce/apex/ItemJacketSPMultiFilesController.getAllDocumentsByJacket";
import checkUserAccessforComponent from "@salesforce/apex/ItemJacketSPMultiFilesController.checkUserAccessforComponent";
import getDocumentTypes from "@salesforce/apex/ItemJacketSPMultiFilesController.getDocumentTypes";
import checkforExistingMultipleFiles from "@salesforce/apex/ItemJacketSPMultiFilesController.checkforExistingMultipleFiles";
import handleDeleteDocument from "@salesforce/apex/ItemJacketSPMultiFilesController.handleDeleteDocument";

import Item_Jacket_Sharepoint_Site_Relative_Url from "@salesforce/label/c.Item_Jacket_Sharepoint_Site_Relative_Url";
import TenantURL from "@salesforce/label/c.SharePoint_Tenant_Url";

// Item Jacket fields
import ItemJacket_OBJECT from "@salesforce/schema/Item_Jacket__c";
import Id_Field from "@salesforce/schema/Item_Jacket__c.Id";
import Name_Field from "@salesforce/schema/Item_Jacket__c.Name";
import PlantId_Field from "@salesforce/schema/Item_Jacket__c.Plant_Id_Formula__c";
import CloningCompleted_Field from "@salesforce/schema/Item_Jacket__c.Cloning_Completed__c";

const FIELDS = [Id_Field, Name_Field, PlantId_Field, CloningCompleted_Field];

export default class itemJacketSharePointMultipleFiles extends LightningElement {
  token = "";
  @api recordId;
  @api objectApiName = ItemJacket_OBJECT; //Fetches document types
  itemJacketName;
  itemjacket;
  plantId;

  // html disply control values
  hasEditAccess = false;
  hasReadAccess = false;
  displayAccessMessage;
  showLoadingMessage = false;
  showNoDocuments = false; //If no documents loaded from SharePoint
  showIsUploading = false;
  @api documentDetail = false;
  @track allDocuments = [];

  // Drop-down list values
  @track options; //Document type options
  @track overWriteOptions = [
    { label: "Yes", value: "Yes" },
    { label: "No", value: "No" }
  ]; //Dropdown options for overwrite

  // Used to toggle modal pop-up box visibility
  @api showFilePropertiesModal = false;
  @api showOverWriteModal = false; //Toggles overwrite modal
  @api showProgressBarModal = false; //Toggles progress bar modal
  @track showSpinner = false; //Toggles spinner display on doc deletes. Still necessary? Likely can be removed.
  @api isCheckingFileExists = false; //Shows status message while files are being checked. Currently all references are false. Still using?
  @api showErrorModal = false; //Toggles error modal
  @track isConfirmationDialogVisible = false; //Used on document deletes, toggles confirmation-dialog component visibility
  @track errorWhileGettingFiles = false; //Toggles display of error message when fetching files from SP

  // To handle content visibility inside modal pop-up
  @track originalMessage; //Used on deletes, tracks document ID from SP
  @track displayFilePropertiesModalError = false; //Displays error in file properties modal, Ref: displayErrorMessage, closeFilePropertiesModal, getDocumentIdByServerUrl
  @api showDocumentPropertiesForm = false; //Shows documents form with file name and document type column
  filesFailed = false;
  displayErrorFiles = false;
  displaySizeExceededFiles = false;
  isFileUploadCompleted = false;

  // Used to handle checkboxes on Set File Property and Overwrite modal pop-up
  @track selectedDocTypeValues = [];
  @track selectedOverWriteValue = []; //Handles storing selections for overwrite fields for multiple updates

  // file upload values
  @api files = []; // stores all the selected/dropped files
  @api newFiles = []; // stores only new files and used on set file preperties modal
  @api existingFiles = []; // stores existing files and used on Existing files modal
  @track fileDetails = []; // stores all the file names and document type
  fileSizeExceeded = []; // stores file name of the files more than 249MB file size
  sameNameAtDiffLevel = []; // stores file names which is same on different folder level
  unsupportedFiles = []; // stores files with unsupported file format
  filesWithSpecialCharacter = []; // stores file names with special character
  @track failedFiles = []; // stores files which are failed to upload

  // Values to update document type to Yes/No
  documentTypesToUpdate = {};
  @track selectedDocTypeFieldAPIName = "";

  // SharePoint auth subscription
  subscription;

  // Item Jacket Event subscription
  refreshSubscription;

  // fetch SharePoint document timers
  delayTimerConstant = 10000;
  delayTimer = 40000;
  delayInitial = 40000;
  attemptUploadAndUpdateInProgress = false;

  oldDocSize;
  isOverwriteFile = false;
  overwriteFileName;
  existingFileTimestamp;

  // Display error messages on different modal pop-up
  @track filePropertiesModalEM = ""; //Error message in file properties modal
  @track errorModalEM = "";
  progressBarModalError = "";

  // Error object for displaying messages in modals
  // Props:
  // isError(boolean) - Whether there is an error
  // message(string) - Which messages should be displayed
  // files(array) - Array of files to display with error (if any)
  @track error = { isError: false, message: "", files: [] };

  // static Error Messages (EM)
  permanentlyFailedEM =
    "The below files failed to upload. Please try again later.";
  fileSizeExceededEM =
    "The files below exceed the file size limit of 249 MB and will not be uploaded.";
  authenticationEM =
    "Authentication Failed or User Cancelled Authentication Request or a pop-up window was blocked.";
  fileUploadInProgressEM = "File upload is in progress. Please wait.";
  selectedDocTypeEM = "Please select document type for all files.";
  specialCharacterEM =
    "The files below contain unsupported characters. Please rename and try again.";
  emptyFolderEM =
    "The folder is empty. Please try again with a single folder or file(s).";
  moreThan100FilesEM =
    "You cannot upload more than 100 files. Please try again.";
  nestedFolderEM =
    "The folder you selected contains more than 3 nested subfolders. Please try again.";
  sameFileNameEM =
    "You cannot upload files with the same name. The files name(s) that have been used multiple times are below.";
  invalidFileFormatEM =
    "The files below have an invalid file format. Please try again.";
  fileFolderCombinationEM =
    "You cannot upload a combination of files and folders. Please try again with a single folder or file(s).";
  multipleFoldersEM =
    "You cannot upload multiple folders. Please try again with a single folder or file(s).";

  //Limits variables
  MAX_FOLDER_DEPTH = 3;
  MAX_FILES_ALLOWED = 100;
  MAX_FILE_SIZE = 261095424;
  MAX_RETRIES = 3;

  // Counts to track files
  retryCount = 0; //stores file upload retry count
  folderLevel = []; // store folder level
  uploadedFiles = 0; // Used to display upload count on progress bar

  uploadToken = ""; // This is created for testing retry logic, replace it's reference with token and remove this variable once testing is completed

  getacceptedFormats() {
    return [
      ".exe, .pif, .application, .gadget, .msi, .msp, .com, .scr, .hta, .cpl, .msc, .jar, .dll, .bat, .cmd, .vb, .vbs, .vbe, .js, .jse, .ws, .wsf, .wsc, .wsh, .ps1, .ps1xml, .ps2, .ps2xml, .psc1, .psc2, .msh, .msh1, .msh2, .mshxml, .msh1xml, .msh2xml, .scf, .lnk, .inf, .reg"
    ];
  }

  //Trigger: component is added to DOM
  connectedCallback() {
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

  //Get document types from Item Jacket object fieldset
  //Trigger: Called from connectedCallback
  fetchDocumentTypes() {
    getDocumentTypes({ sObjectName: this.objectApiName }).then((data) => {
      if (data) {
        let typeOptions = [];
        for (var key in data) {
          typeOptions.push({ label: data[key], value: key });
        }
        typeOptions.push({ label: "Other", value: "Other" });
        this.options = typeOptions;
      }
    });
  }

  //Get Item Jacket record data for clone, then fetch from SP
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
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Error!",
          message:
            "Error while getting Item Jacket Name and Plant Id. " + error,
          variant: "error"
        })
      );
    }
  }

  //Trigger: Within getRecord @wire function for Item Jacket
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

  //context for LMS
  @wire(MessageContext)
  messageContext;

  subscribeToSharepointTokenChannel() {
    console.log("subscribing to Sharepoint Token Channel");
    if (!this.subscription) {
      this.subscription = subscribe(
        this.messageContext,
        SharePointToken,
        (message) => {
          this.handleSharePointTokenReceived(message);
        }
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
    var _this = this;
    if (message.token && message.token != "Error") {
      this.token = "Bearer " + message.token;
      this.documentTypesToUpdate[Id_Field.fieldApiName] = this.recordId;
      let promises = [];
      for (let file of this.files) {
        if (file.size > 261095424) {
          this.fileSizeExceeded.push(file.name);
          this.files = this.files.filter((e) => e.name !== file.name);
        } else {
          let filePromise = new Promise((resolve) => {
            let fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file);
            var documentType = _this.fileDetails.find(
              (fname) => fname.name === file.name
            ).documentType;
            fileReader.onloadend = () =>
              resolve({
                name: file.name,
                content: fileReader.result,
                byteLength: fileReader.result.byteLength,
                documentType: documentType
              });
          });
          promises.push(filePromise);
        }
      }
      Promise.all(promises).then(async (fileContents) => {
        for (var fileContent of fileContents) {
          this.uploadToken = this.token;
          await _this.handleUploadWithRESTAPI(
            fileContent.name,
            fileContent.content,
            fileContent.byteLength,
            fileContent.documentType
          );
        }
        this.checkFailedFilesAndRefreshComponent();
      });
    } else if (message.token == "Error") {
      this.progressBarModalError = this.authenticationEM;
      this.isFileUploadCompleted = true;
    }
  }

  checkFailedFilesAndRefreshComponent() {
    if (this.failedFiles.length > 0) {
      this.retryFailedFiles();
    } else {
      this.isFileUploadCompleted = true;
      this.progressBarModalError = "";
      if (this.fileSizeExceeded.length > 0) {
        this.displaySizeExceededFiles = true;
        this.progressBarModalError = this.fileSizeExceededEM;
      }
      this.handleUpdateofItemJacket();
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
    }
  }

  async retryFailedFiles() {
    console.log("inside retryFailedFiles");
    this.retryCount = this.retryCount + 1;
    console.log(this.retryCount);
    if (this.retryCount < 3) {
      for (var fileContent of this.failedFiles) {
        this.failedFiles.splice(this.failedFiles.indexOf(fileContent), 1);
        await this.handleUploadWithRESTAPI(
          fileContent.name,
          fileContent.content,
          fileContent.byteLength,
          fileContent.documentType
        );
      }
      this.checkFailedFilesAndRefreshComponent();
    } else if (this.failedFiles.length > 0) {
      console.log("permanently failed files");
      console.log(this.failedFiles);
      this.filesFailed = true;
      this.isFileUploadCompleted = true;
      this.progressBarModalError = "";
      if (this.fileSizeExceeded.length > 0) {
        this.displaySizeExceededFiles = true;
        this.progressBarModalError = this.fileSizeExceededEM;
      }
    }
  }

  fetchDocumentsFromSP() {
    //get documents from sharepoint by making httpcallout from server
    getAllDocumentsByJacket({
      folderName: getFieldValue(this.itemjacket, Name_Field),
      libraryName: getFieldValue(this.itemjacket, PlantId_Field),
      JacketId: this.recordId,
      hasEditAccess: this.hasEditAccess
    })
      .then((result) => {
        if (
          result.length > 0 &&
          result[0].hasOwnProperty("isSuccess") &&
          result[0].isSuccess == "false"
        ) {
          this.errorWhileGettingFiles = true;
          this.showLoadingMessage = false;
          this.showSpinner = false;
          return;
        }
        this.documentDetail = true;
        this.allDocuments = result;
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
        if (error.status != 200) {
          this.errorWhileGettingFiles = true;
        }
        this.showSpinner = false;
        this.showLoadingMessage = false;
      });
  }

  handleFileTypeSelectionChange(event) {
    if (event.target.label === "Document Type") {
      for (var file of this.fileDetails) {
        if (file.name === event.target.name) {
          file.documentType = event.target.options.find(
            (opt) => opt.value === event.detail.value
          ).label;
        }
      }
    }

    if (this.selectedDocTypeValues.indexOf(event.target.name) != -1) {
      for (var i = 0; i < this.selectedDocTypeValues.length; i++) {
        var selected = this.template.querySelectorAll(
          '[data-id="' + this.selectedDocTypeValues[i] + '"]'
        )[0];
        selected.value = event.target.value;
        this.fileDetails.find(
          (e) => e.name === this.selectedDocTypeValues[i]
        ).documentType = event.target.options.find(
          (opt) => opt.value === event.detail.value
        ).label;
      }
    }

    console.log(this.fileDetails);
  }

  //Makes HTTP Callout to check for Existing Files
  CheckifFileExistsinSPO() {
    var tempFileName = [];
    for (var file of this.files) {
      tempFileName.push(file.name);
      this.fileDetails.push({ name: file.name });
    }
    checkforExistingMultipleFiles({
      recordId: this.recordId,
      libraryName: this.plantId,
      fileName: JSON.stringify(tempFileName)
    }).then((result) => {
      var parsedResult = JSON.parse(result);
      if (parsedResult.isSuccess) {
        var tempExistingFiles = parsedResult.response.filter(
          (e) => e.isExists === true
        );
        for (var i = 0; i < tempExistingFiles.length; i++) {
          this.existingFiles.push({
            name: tempExistingFiles[i].fileName,
            isExist: tempExistingFiles[i].isExists,
            documentType: tempExistingFiles[i].documentType
          });
          this.fileDetails[
            this.fileDetails.findIndex(
              (e) => e.name === tempExistingFiles[i].fileName
            )
          ].documentType = tempExistingFiles[i].documentType;
        }
        var tempNewFiles = parsedResult.response.filter(
          (e) => e.isExists === false
        );
        for (var i = 0; i < tempNewFiles.length; i++) {
          this.newFiles.push({
            name: tempNewFiles[i].fileName,
            isExist: tempNewFiles[i].isExists
          });
        }
        this.newFiles.sort((a, b) =>
          a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        );
        this.existingFiles.sort((a, b) =>
          a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        );
        if (this.existingFiles.length) {
          this.isCheckingFileExists = false;
          this.showSpinner = false;
          this.showOverWriteModal = true;
        } else {
          this.showOverWriteModal = false;
          this.isCheckingFileExists = false;
          this.showSpinner = false;
          //this.handleFilesPropertiesModal();
          this.showFilePropertiesModal = true;
          this.showDocumentPropertiesForm = true;
        }
      }
    });
  }

  handleUpdateofItemJacket() {
    console.log("handleUpdateofItemJacket");
    console.log(this.documentTypesToUpdate);
    const fields = this.documentTypesToUpdate;

    updateRecord({ fields })
      .then((result) => {
        console.log(result);
        getRecordNotifyChange([{ recordId: this.recordId }]);
      })
      .catch((error) => {
        console.log(
          "Error while updating document type." + JSON.stringify(error)
        );
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error!",
            message: "Error while updating document type.",
            variant: "error"
          })
        );
      });
  }

  handleUpdateofItemJacketToNo() {
    console.log("handleUpdateofItemJacket");
    const fields = {};
    fields[Id_Field.fieldApiName] = this.recordId;
    fields[this.selectedDocTypeFieldAPIName] = "No";
    if (this.selectedDocTypeFieldAPIName != "Other") {
      updateRecord({ fields })
        .then((result) => {
          console.log(result);
          getRecordNotifyChange([{ recordId: this.recordId }]);
        })
        .catch((error) => {
          console.log(
            "Error while updating document type. " + JSON.stringify(error)
          );
          this.dispatchEvent(
            new ShowToastEvent({
              title: "Error!",
              message: "Error while updating document type.",
              variant: "error"
            })
          );
        });
    }
  }

  //Trigger: Delete button from SharePoint files list, Confirm button in delete modal
  handledeleteFileFromSP(event) {
    if (event.currentTarget.name === "openConfirmation") {
      this.originalMessage = event.currentTarget.dataset.id;
      this.isConfirmationDialogVisible = true;
    } else if (event.currentTarget.name === "confirmModal") {
      if (event.detail !== 1) {
        let recordIdToBeDeleted = event.detail.originalMessage;
        console.log("recordIdToBeDeleted", recordIdToBeDeleted);
        if (event.detail.status === "Yes") {
          this.showSpinner = true;
          handleDeleteDocument({
            libraryName: this.plantId,
            itemId: recordIdToBeDeleted
          })
            .then((responseData) => {
              console.log(responseData);
              if (!responseData.isSuccess) {
                throw "Error while deleting a file from SharePoint. Please try again.";
              }
              if (
                responseData &&
                responseData.isSuccess &&
                responseData.itemCount == 0
              ) {
                this.selectedDocTypeFieldAPIName = this.options.filter(
                  (option) => option.label == responseData.documentType
                )[0].value;
                this.handleUpdateofItemJacketToNo();
              }
              this.dispatchEvent(
                new ShowToastEvent({
                  title: "Success!",
                  message: "File deleted from Sharepoint.",
                  variant: "success"
                })
              );
              this.fetchDocumentsFromSP();
              this.showSpinner = false;
              this.isConfirmationDialogVisible = false;
              return;
            })
            .catch((error) => {
              console.error("Error:", error);
              this.showSpinner = false;
              this.isFileExists = false;
              this.isConfirmationDialogVisible = false;
              this.dispatchEvent(
                new ShowToastEvent({
                  title: "Error!",
                  message: error,
                  variant: "error"
                })
              );
            });
        } else if (event.detail.status === "No") {
          console.log("cancel");
          this.isConfirmationDialogVisible = false;
        }
      }
    }
  }

  closeFilePropertiesModal() {
    this.showFilePropertiesModal = false;
    this.resetVariables();
  }

  //Clears necessary variables when dialogs are closed/reset
  resetVariables() {
    this.token = "";
    this.files = [];
    this.newFiles = [];
    this.existingFiles = [];
    this.fileDetails = [];
    this.fileSizeExceeded = [];
    this.sameNameAtDiffLevel = [];
    this.unsupportedFiles = [];
    this.filesWithSpecialCharacter = [];
    this.failedFiles = [];
    this.selectedDocTypeValues = [];
    this.selectedOverWriteValue = [];
    this.retryCount = 0;
    this.folderLevel = [];
    this.uploadedFiles = 0;
    this.filesFailed = false;
    this.isFileUploadCompleted = false;
    this.displaySizeExceededFiles = false;
    this.displayFilePropertiesModalError = false;
    this.errorModalEM = "";
    this.filePropertiesModalEM = "";
    this.progressBarModalError = "";
    this.error = { isError: false, message: "", files: [] };
  }

  handleOverWriteProperty(event) {
    if (this.selectedOverWriteValue.indexOf(event.target.name) != -1) {
      for (var i = 0; i < this.selectedOverWriteValue.length; i++) {
        this.template.querySelectorAll(
          '[data-id="' + this.selectedOverWriteValue[i] + '"]'
        )[0].value = event.target.value;
        this.fileDetails.find(
          (e) => e.name === this.selectedOverWriteValue[i]
        ).overWrite = event.target.value;
        this.existingFiles.find(
          (e) => e.name === this.selectedOverWriteValue[i]
        ).overWrite = event.target.value;
      }
    } else {
      this.existingFiles.find((e) => e.name === event.target.name).overWrite =
        event.target.value;
      this.fileDetails.find((e) => e.name === event.target.name).overWrite =
        event.target.value;
    }
  }

  //This saves overwrite choices for any existing files and removes any "No" selections from files to be uploaded
  saveOverWriteModalProperties() {
    for (var file of this.existingFiles) {
      if (file.overWrite == "No") {
        this.files = this.files.filter((el) => el.name !== file.name);
      }
    }
    this.showOverWriteModal = false;
    if (!this.files.length) {
      this.closeOverWriteModal();
    } else if (this.newFiles.length) {
      this.showFilePropertiesModal = true;
      this.showDocumentPropertiesForm = true;
    } else {
      this.handleFileUploadToSharePoint();
    }
  }

  closeOverWriteModal() {
    this.showOverWriteModal = false;
    this.resetVariables();
  }

  handleDisplayError(error) {
    if (
      error.hasOwnProperty("message") &&
      error.hasOwnProperty("isError") &&
      error.hasOwnProperty("files") &&
      error.isError
    ) {
      this.openErrorModal(
        error.message,
        error.files.length == 0 ? false : true
      );
    } else {
      console.log(error);
    }
  }

  openErrorModal(error, displayErrorFiles) {
    this.errorModalEM = error;
    this.showErrorModal = true;
    this.displayErrorFiles = displayErrorFiles;
  }

  closeErrorModal() {
    this.showErrorModal = false;
    this.resetVariables();
  }

  closeProgressBarModal() {
    if (this.isFileUploadCompleted == true) {
      this.showProgressBarModal = false;
      this.resetVariables();
    } else {
      this.progressBarModalError = this.fileUploadInProgressEM;
    }
  }

  handleFileUploadToSharePoint() {
    console.log(this.fileDetails);
    for (var file of this.fileDetails) {
      if (file.documentType == null || !file.documentType) {
        //this.displayErrorMessage(this.selectedDocTypeEM, true);
        this.displayFilePropertiesModalError = true;
        this.filePropertiesModalEM = this.selectedDocTypeEM;
        return;
      }
    }
    this.showFilePropertiesModal = false;
    this.showProgressBarModal = true;
    this.displayFilePropertiesModalError = false;
    this.filePropertiesModalEM = "";
    this.updateProgressBar();
    this.subscribeToSharepointTokenChannel();
    this.publishSharePointTokenRequest();
  }

  handleCachedFile() {
    console.log("HandleCachedFile");
    console.log(this.files);

    let badExts = this.getacceptedFormats();
    let badFileExts = badExts[0].split(",").map(function (value) {
      return value.trim();
    });
    let fileNameConflicts = this.checkForNameConflict(this.files);
    let specialChars = /["*:<>/|\\]/;
    let specialCharFiles = [];
    let badExtFiles = [];
    let dupeFiles = [];
    let largeFiles = [];

    for (let file of this.files) {
      if (
        badFileExts.includes("." + file.name.toLowerCase().split(".").pop())
      ) {
        badExtFiles.push(file.name);
      }
      if (specialChars.test(file.name)) {
        specialCharFiles.push(file.name);
      }
      if (file.size > this.MAX_FILE_SIZE) {
        largeFiles.push(file.name);
      }
    }
    if (fileNameConflicts.isDuplicate) {
      dupeFiles = [
        ...new Set(
          fileNameConflicts.matches.map(function (item) {
            return item.name;
          })
        )
      ];
    }

    //Begin checks: special files, bad file extensions, duplicate files,
    if (specialCharFiles.length) {
      this.error.isError = true;
      this.error.message = this.specialCharacterEM;
      this.error.files = specialCharFiles;
    } else if (badExtFiles.length) {
      this.error.isError = true;
      this.error.message = this.invalidFileFormatEM;
      this.error.files = badExtFiles;
    } else if (dupeFiles.length) {
      this.error.isError = true;
      this.error.message = this.sameFileNameEM;
      this.error.files = dupeFiles;
    } else if (largeFiles.length) {
      this.error.isError = true;
      this.error.message = this.fileSizeExceededEM;
      this.error.files = largeFiles;
    } else if (this.files.length == 0) {
      this.error.isError = true;
      this.error.message = this.emptyFolderEM;
    }

    if (this.error.isError) {
      this.files = [];
      this.handleDisplayError(this.error);
      return;
    } else {
      this.showSpinner = true;
      this.isCheckingFileExists = true;
      this.CheckifFileExistsinSPO();
    }
  }

  selectFile(event) {
    for (var file of event.target.files) {
      if (this.files.length > this.MAX_FILES_ALLOWED) {
        this.files = [];
        this.error.isError = true;
        this.error.message = this.moreThan100FilesEM;
        break;
      } else {
        this.files.push(file);
      }
    }

    if (this.error.isError) {
      this.handleDisplayError(this.error);
    } else {
      this.handleCachedFile();
    }

    //Clears file data from input
    var inputField = this.template.querySelectorAll("input");
    inputField.forEach((element) => {
      element.value = "";
    });
  }

  selectFolder(event) {
    //var format = /["*:<>/|\\]/;
    var length = 0;
    for (var file of event.target.files) {
      if (file.webkitRelativePath.match(/\//g).length > 4) {
        this.files = [];
        this.error.isError = true;
        this.error.message = this.nestedFolderEM;
        break;
      } else if (this.files.length >= this.MAX_FILES_ALLOWED) {
        this.files = [];
        this.error.isError = true;
        this.error.message = this.moreThan100FilesEM;
        break;
      } else {
        this.files.push(file);
      }
    }

    //Clears file data from input
    var inputField = this.template.querySelectorAll("input");
    inputField.forEach((element) => {
      element.value = "";
    });

    if (this.error.isError) {
      this.handleDisplayError(this.error);
    } else {
      this.handleCachedFile();
    }
  }

  checkForNameConflict(files) {
    files = Array.from(files);
    let fileDetails = files.map(function (item) {
      return item.name;
    });
    let matches = [];

    let isDuplicate = fileDetails.some(function (item, idx) {
      let index = fileDetails.indexOf(item);
      let match = index != idx;
      match
        ? matches.push({
            name: files[idx].name
          })
        : "";
      return false;
    });

    isDuplicate = matches.length > 0;
    let result = {
      isDuplicate: isDuplicate,
      matches: matches
    };

    return result;
  }

  dragOverHandler(event) {
    event.preventDefault();
  }

  dropHandler(event) {
    event.stopPropagation();
    event.preventDefault();
    this.handleDrops(event.dataTransfer.items);
  }

  entryToFile(entry) {
    return new Promise((resolve, reject) => {
      entry.file(resolve, reject);
    });
  }

  //Handles directory traversal recursively when folder is dropped
  async expandFolder(entry, level) {
    console.log("Expanding Folder, current level: " + level);
    console.log("Folder name: " + entry.name);
    let reader = entry.createReader();

    if (this.error.isError) {
      console.log("Detected error");
      console.log(this.error);
      return;
    }

    //Termination condition
    if (level > this.MAX_FOLDER_DEPTH) {
      this.files = [];
      this.error.isError = true;
      this.error.message = this.nestedFolderEM;
      console.log("Maximum nested folder depth exceeded");
      return;
    }

    console.log("Reading all entries");
    let contents = await this.readAllEntries(reader);
    console.log("Contents retrieved. Looping through...");
    console.log(contents.map((item) => item.name));
    for (let item of contents) {
      if (this.error.isError) {
        console.log("Detected error");
        console.log(this.error);
        break;
      }
      console.log("Name: " + item.name);
      console.log("Path: " + item.fullPath);
      if (item.isFile) {
        console.log("File identified");
        let file = await this.entryToFile(item);
        if (this.files.length < this.MAX_FILES_ALLOWED) {
          console.log("Adding to files array");
          this.files.push(file);
        } else if (this.files.length >= this.MAX_FILES_ALLOWED) {
          this.files = [];
          this.error.isError = true;
          this.error.message = this.moreThan100FilesEM;
          console.log("Maximum file allotment exceeded");
          break;
        }
      } else if (item.isDirectory) {
        console.log("Folder identified");
        console.log("Processing folder...");
        await this.expandFolder(item, level + 1);
      }
    }
  }

  //Completes all the passes of reading a directory for contents
  async readAllEntries(reader) {
    const result = await this.readEntries(reader);
    if (result.finished) {
      return result.entryData;
    } else {
      return result.entryData.concat(await this.readAllEntries(reader));
    }
  }

  //Completes a single pass of reading a directory for contents
  async readEntries(reader) {
    let fin = false;
    const tryThis = new Promise((resolve, reject) => {
      reader.readEntries((entries) => {
        if (!entries.length) {
          fin = true;
        }
        resolve(entries);
      });
    });

    let eArray = await tryThis;
    return {
      entryData: eArray,
      finished: fin
    };
  }

  //Handles dropped content and either traverses folders or pushes files to array
  async handleDrops(items) {
    console.log("Handling dropped items: " + items.length + " items");
    var isDirectory = false;
    var isFile = false;
    //Checks for mix of files/directories or multiple directories
    for (let i = 0; i < items.length; i++) {
      let item = items[i].webkitGetAsEntry(); //item = DataTransferItem > FileSystemFileEntry OR FileSystemDirectoryEntry
      if (item) {
        //Prevents error on dropped text/image
        if (item.isDirectory) {
          if (isFile) {
            this.files = [];
            this.error.isError = true;
            this.error.message = this.fileFolderCombinationEM;
            break;
          } else if (isDirectory) {
            this.files = [];
            this.error.isError = true;
            this.error.message = this.multipleFoldersEM;
            break;
          } else {
            isDirectory = true;
          }
        } else if (item.isFile) {
          if (isDirectory) {
            this.files = [];
            this.error.isError = true;
            this.error.message = this.fileFolderCombinationEM;
            break;
          } else {
            isFile = true;
          }
        }
      }
    }

    let filePromises = [];
    for (let i = 0; i < items.length; i++) {
      if (this.error.isError) {
        //console.log('Detected error');
        //console.log(this.error);
        break;
      }

      let item = items[i].webkitGetAsEntry();
      if (item) {
        if (item.isDirectory) {
          await this.expandFolder(item, 0);
        } else if (item.isFile) {
          console.log("File identified");
          filePromises.push(this.entryToFile(item));
        }
      }
    }
    //Fulfills all file promises into array then attempts to push to files array
    if (filePromises.length) {
      let rootFiles = await Promise.all(filePromises);
      if (this.files.length + rootFiles.length > this.MAX_FILES_ALLOWED) {
        this.files = [];
        this.error.isError = true;
        this.error.message = this.moreThan100FilesEM;
      } else {
        rootFiles.forEach((file) => {
          this.files.push(file);
        });
      }
    }
    console.log("Finished handling dropped items");
    if (this.error.isError) {
      this.handleDisplayError(this.error);
      return;
    } else {
      console.log("Handling files");
      this.handleCachedFile();
    }
  }

  updateProgressBar() {
    var styles = {
      position: "absolute",
      top: "0",
      left: "0",
      height: "30px",
      "border-radius": "4px",
      "background-color": "#04AA6D",
      "box-shadow":
        "0 4px 8px 0 rgba(0, 125, 0, 0.25), 0 6px 20px 0 rgba(0, 125, 0, 0.24)",
      "text-align": "center",
      "line-height": "30px",
      color: "white"
    };
    setTimeout(() => {
      var width = (this.uploadedFiles / this.files.length) * 100;
      width = Math.round(width);
      var progressBar = this.template.querySelector('[data-id="ProgressBar"]');
      var progressBarText = this.template.querySelector(
        '[data-id="ProgressBarText"]'
      );
      Object.assign(progressBar.style, styles);
      progressBar.style.width = width + "%";
      progressBarText.innerHTML =
        this.uploadedFiles + "/" + this.files.length + " File(s) Uploaded";
    });
  }

  handleDocumentTypeCheckboxOverWrite(event) {
    if (event.target.checked) {
      this.selectedOverWriteValue.push(event.target.name);
      let checkboxesoverwrite = this.template.querySelectorAll(
        '[data-class="cusOver_DocTypeHelper"]'
      );

      let length = 0;
      for (var i = 0; i < checkboxesoverwrite.length; i++) {
        console.log(checkboxesoverwrite[i].checked);
        checkboxesoverwrite[i].checked == true
          ? (length = length + 1)
          : (length = length - 1);
      }
      checkboxesoverwrite.length == length
        ? (this.template.querySelectorAll(
            '[data-id="selectAllDocumentTypeOverwrite"]'
          )[0].checked = true)
        : (this.template.querySelectorAll(
            '[data-id="selectAllDocumentTypeOverwrite"]'
          )[0].checked = false);
    } else {
      this.selectedOverWriteValue.splice(
        this.selectedOverWriteValue.indexOf(event.target.name),
        1
      );
      this.template.querySelectorAll(
        '[data-id="selectAllDocumentTypeOverwrite"]'
      )[0].checked = false;
      length = length - 1;
    }
  }

  handleDocumentTypeCheckbox(event) {
    if (event.target.checked) {
      this.selectedDocTypeValues.push(event.target.name);
      let checkboxes = this.template.querySelectorAll(
        '[data-class="cus_DocTypeHelper"]'
      );
      let length = 0;
      for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked == true
          ? (length = length + 1)
          : (length = length - 1);
      }
      checkboxes.length == length
        ? (this.template.querySelectorAll(
            '[data-id="selectAllDocumentType"]'
          )[0].checked = true)
        : (this.template.querySelectorAll(
            '[data-id="selectAllDocumentType"]'
          )[0].checked = false);
    } else {
      this.selectedDocTypeValues.splice(
        this.selectedDocTypeValues.indexOf(event.target.name),
        1
      );
      this.template.querySelectorAll(
        '[data-id="selectAllDocumentType"]'
      )[0].checked = false;
      length -= 1;
    }
  }

  handleSelectAllDocumentTypeChkOverWrite(event) {
    this.selectedOverWriteValue = [];
    var checkboxesoverwrite = this.template.querySelectorAll(
      '[data-id="documentTypeChkOverWrite"]'
    );
    for (var i = 0; i < checkboxesoverwrite.length; i++) {
      checkboxesoverwrite[i].checked = event.target.checked;
      event.target.checked
        ? this.selectedOverWriteValue.push(checkboxesoverwrite[i].name)
        : "";
    }
  }

  handleSelectAllDocumentTypeChk(event) {
    this.selectedDocTypeValues = [];
    var checkboxes = this.template.querySelectorAll(
      '[data-id="documentTypeChk"]'
    );
    for (var i = 0; i < checkboxes.length; i++) {
      checkboxes[i].checked = event.target.checked;
      event.target.checked
        ? this.selectedDocTypeValues.push(checkboxes[i].name)
        : "";
    }
  }

  async handleUploadWithRESTAPI(
    fileName,
    fileContent,
    byteLength,
    documentType
  ) {
    console.log("handleUploadWithRESTAPI");
    var _this = this;
    var updatedFileName = encodeURIComponent(fileName);
    updatedFileName = updatedFileName.replace(/'/g, "''");
    var url1 =
      TenantURL +
      Item_Jacket_Sharepoint_Site_Relative_Url +
      "/_api/web/GetFolderByServerRelativePath(decodedurl='" +
      Item_Jacket_Sharepoint_Site_Relative_Url +
      "/Drop Off Library')/Files/AddUsingPath(overwrite=true,decodedurl='" +
      updatedFileName +
      "')";

    const siteUrlnew =
      TenantURL +
      Item_Jacket_Sharepoint_Site_Relative_Url +
      "/_api/contextinfo";
    try {
      await fetch(siteUrlnew, {
        method: "POST",
        processData: false,
        mode: "cors",
        contentType: false,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: _this.token,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache",
          pragma: "no-cache"
        }
      })
        .then((r) => r.json())
        .then((digestValue) => {
          if (digestValue["odata.error"]) {
            console.log(digestValue["odata.error"].message.value);
            throw (
              "Error while getting Digest Value. " +
              digestValue["odata.error"].message.value +
              " Please try again."
            );
          }
          return fetch(url1, {
            method: "POST",
            headers: {
              "X-RequestDigest": digestValue.FormDigestValue,
              Accept: "application/json; odata=verbose",
              "content-length": byteLength,
              "content-type": "application/json;odata=verbose",
              //"Authorization": _this.token
              Authorization: this.uploadToken
            },
            body: fileContent
          })
            .then((attchResult) => {
              console.log("File uploaded", attchResult);
              if (!attchResult.ok) {
                throw "Error while uploading file. Please try again.";
              }
              return this.GetDocumentIDByServerUrl(updatedFileName)
                .then((itm) => {
                  console.log(itm);
                  if (itm["odata.error"]) {
                    console.log(itm["odata.error"].message.value);
                    throw (
                      "Error in GetDocumentIDByServerUrl. " +
                      itm["odata.error"].message.value +
                      " Please try again."
                    );
                  }
                  return this.updateFileMetaData(
                    itm.Id,
                    {
                      PlantIdFormula: this.plantId,
                      ItemJacketName: this.itemJacketName,
                      RecordID: this.recordId,
                      DocumentType: documentType
                    },
                    digestValue.FormDigestValue,
                    _this.token
                  )
                    .then((f) => {
                      console.log(f);
                      if (!f.ok) {
                        throw "File did not complete successfully. Setting file properties failed. Please try again.";
                      }
                      if (documentType != "Other") {
                        this.documentTypesToUpdate[
                          this.options.find(
                            (dt) => dt.label === documentType
                          ).value
                        ] = "Yes";
                      }
                      this.showSpinner = false;
                      this.uploadedFiles = this.uploadedFiles + 1;
                      this.updateProgressBar();
                    })
                    .catch((error) => {
                      console.log(
                        "File did not complete successfully. Setting file properties failed. Please try again.",
                        error
                      );
                      this.failedFiles.push({
                        name: fileName,
                        content: fileContent,
                        byteLength: byteLength,
                        documentType: documentType
                      });
                    });
                })
                .catch((error) => {
                  console.log("Error in GetDocumentIDByServerUrl", error);
                  this.failedFiles.push({
                    name: fileName,
                    content: fileContent,
                    byteLength: byteLength,
                    documentType: documentType
                  });
                });
            })
            .catch((error) => {
              console.log("Error in File Upload.", error);
              this.failedFiles.push({
                name: fileName,
                content: fileContent,
                byteLength: byteLength,
                documentType: documentType
              });
            });
        })
        .catch((error) => {
          console.log("Error while getting digest value.", error);
          this.failedFiles.push({
            name: fileName,
            content: fileContent,
            byteLength: byteLength,
            documentType: documentType
          });
        });
    } catch (error) {
      console.error("Error:", error);
      this.showSpinner = false;
    }
  }

  GetDocumentIDByServerUrl(fileName) {
    console.log("Inside GetDocumentIDByServerUrl");

    var reqUrl =
      TenantURL +
      Item_Jacket_Sharepoint_Site_Relative_Url +
      `/_api/web/GetFileByServerRelativePath(decodedurl='` +
      Item_Jacket_Sharepoint_Site_Relative_Url +
      `/Drop Off Library/${fileName}')/ListItemAllFields`;
    return fetch(reqUrl, {
      method: "GET",
      headers: {
        Authorization: this.token,
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
        this.displayFilePropertiesModalError = true;
        this.showFilePropertiesModal = true;
        this.showDocumentPropertiesForm = true;
        this.filePropertiesModalEM = "Error in GetDocumentIDByServerUrl.";
      });
  }

  updateFileMetaData(ItemId, metaData, digest, token) {
    console.log(metaData);
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
    let overwriteDoc;
    if (!this.attemptUploadAndUpdateInProgress) {
      this.attemptUploadAndUpdateInProgress = true;
      if (this.isOverwriteFile) {
        overwriteDoc = this.allDocuments.filter(
          (doc) => doc.Name == this.overwriteFileName
        )[0];
        this.existingFileTimestamp =
          this.existingFileTimestamp == undefined
            ? overwriteDoc.ModifiedDateTime
            : this.existingFileTimestamp;
        console.log(overwriteDoc);
      }
      setTimeout(() => this.attemptUploadAndUpdate(), this.delayTimer);
      this.delayTimer = this.delayTimerConstant;
    } else {
      getAllDocumentsByJacket({
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

          if (!this.isOverwriteFile) {
            if (uploadPending) {
              console.log("IF > Length has not changed");
              delayAndRunAgain = true;
            } else if (hasInvalidLinks) {
              console.log("ELSE IF > Checking all links");
              delayAndRunAgain = true;
            } else {
              console.log("ELSE > Refresh");
              reset = true;
            }
          }

          if (this.isOverwriteFile) {
            overwriteDoc = this.allDocuments.filter(
              (doc) => doc.Name == this.overwriteFileName
            );
            console.log(overwriteDoc);

            this.existingFileTimestamp =
              this.existingFileTimestamp == undefined
                ? overwriteDoc.ModifiedDateTime
                : this.existingFileTimestamp;
            console.log("existingFileTimestamp", this.existingFileTimestamp);
            console.log(
              "overwriteDoc.ModifiedDateTime",
              overwriteDoc.ModifiedDateTime
            );

            if (this.existingFileTimestamp == overwriteDoc.ModifiedDateTime) {
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
            this.attemptUploadAndUpdateInProgress = false;
            reset = false;
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
          this.existingFileTimestamp = undefined;
          this.overwriteFileName = undefined;
          if (this.allDocuments) this.showNoDocuments = false;
          else this.showNoDocuments = true;
        });
    }
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
