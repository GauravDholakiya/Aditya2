import { LightningElement, track, wire } from "lwc";
import {
  subscribe,
  unsubscribe,
  MessageContext
} from "lightning/messageService";
import taskMessagechannel from "@salesforce/messageChannel/taskMessagechannel__c";

export default class AccountMessagechannelExample extends LightningElement {
  @track messageRecieved;
  @track sourceSystem;

  @wire(MessageContext)
  messageContext;

  connectedCallback() {
    this.subscribeMsg();
  }

  subscribeMsg() {
    if (this.subscription) {
      return;
    }

    this.subscription = subscribe(
      this.messageContext,
      taskMessagechannel,
      (message) => this.handleMessage(message)
    );
  }

  handleMessage(message) {
    this.messageRecieved = message.messagePublish;
    this.sourceSystem = message.sourceLwc;
  }

  unsubscribeMC() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  disconnectedCallback() {}
}