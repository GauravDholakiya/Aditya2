import { LightningElement, wire } from "lwc";
import { publish, MessageContext } from "lightning/messageService";
import taskMessagechannel from "@salesforce/messageChannel/taskMessagechannel__c";
export default class TaskMessagechannelExample extends LightningElement {
  @wire(MessageContext)
  messageContext;

  handleClick() {
    const message = {
      messagePublish: "Im from Task",
      sourceLwc: "task"
    };

    publish(this.messageContext, taskMessagechannel, message);
  }
}