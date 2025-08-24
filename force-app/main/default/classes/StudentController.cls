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
    @AuraEnabled
public static void addStudent(String name, String email, Date dateOfBirth, String className, String status) {
    Student__c stu = new Student__c(
        Name = name,
        Email__c = email,
        Date_of_Birth__c = dateOfBirth,
        Class__c = className,
        Status__c = status
    );
    insert stu;
}
@AuraEnabled
public static void updateStudent(String studentId, String name, String email, Date dateOfBirth, String className, String status) {
    Student__c stu = [SELECT Id FROM Student__c WHERE Id = :studentId LIMIT 1];
    stu.Name = name;
    stu.Email__c = email;
    stu.Date_of_Birth__c = dateOfBirth;
    stu.Class__c = className;
    stu.Status__c = status;
    update stu;
}

@AuraEnabled
public static void deleteStudent(String studentId) {
    Student__c stu = [SELECT Id FROM Student__c WHERE Id = :studentId LIMIT 1];
    delete stu;
}
}