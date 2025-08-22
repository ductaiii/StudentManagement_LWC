import { LightningElement, wire } from 'lwc';
import getStudents from '@salesforce/apex/StudentController.getStudents';

const COLUMNS = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Email', fieldName: 'Email__c', type: 'email' },
    { label: 'Date of Birth', fieldName: 'Date_of_Birth__c', type: 'date' },
    { label: 'Class', fieldName: 'Class__c' },
    { label: 'Status', fieldName: 'Status__c' }
];

export default class StudentList extends LightningElement {
    columns = COLUMNS;
    students;
    error;
    isLoading = true;

    get hasStudents() {
        return this.students && this.students.length > 0;
    }

    @wire(getStudents)
    wiredStudents({ data, error }) {
        this.isLoading = false;
        if (data) {
            this.students = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.students = undefined;
        }
    }
}
