//
global class StudentBatch implements Database.Batchable<SObject> {

    global Database.QueryLocator start(Database.BatchableContext bc) {
        // Lấy toàn bộ student
        return Database.getQueryLocator(
            'SELECT Id, Name, Email__c, Date_of_Birth__c, Class__c, Status__c FROM Student__c'
        );
    }

    global void execute(Database.BatchableContext bc, List<Student__c> scope) {
        // Xử lý logic cho từng batch record
        for(Student__c s : scope) {
            if(s.Status__c == null) {
                s.Status__c = 'Active';
            }
        }

        update scope;
    }

    global void finish(Database.BatchableContext bc) {
        // Sau khi chạy xong hết batch
        System.debug('Batch Student hoàn thành!');
    }
}
