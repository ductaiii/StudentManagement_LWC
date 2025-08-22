public with sharing class StudentController {
    @AuraEnabled(cacheable=true)
    public static List<Student__c> getStudents() {
        try {
            List<Student__c> students = [
                SELECT Id, Name, Email__c, Date_of_Birth__c, Class__c, Status__c FROM Student__c
            ];
            System.debug('Students: ' + students);
            return students;
        } catch (Exception e) {
            System.debug('Error: ' + e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
    }
}