public with sharing class AccountRelatedTaskController {
    @AuraEnabled(cacheable=true)
    public static List<Task> getTasks(String AccId) {
        return [SELECT Id,Subject,Status,ActivityDate,Priority,AccountId,Account.Name,WhoId,Who.Name,WhatId,What.Name from Task where AccountId =: AccId OR WhatId =: AccId];
    }
}