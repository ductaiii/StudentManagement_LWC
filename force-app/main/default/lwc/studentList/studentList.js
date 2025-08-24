import { LightningElement, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import { refreshApex } from '@salesforce/apex';
import getStudents from '@salesforce/apex/StudentController.getStudents';
import STUDENT_MESSAGE_CHANNEL from '@salesforce/messageChannel/studentMessageChannel__c';

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
    subscription = null;
    wiredResult;

    @wire(MessageContext)
    messageContext;

    get hasStudents() {
        return this.students && this.students.length > 0;
    }

    @wire(getStudents)
    wiredStudents(result) {
        this.wiredResult = result;
        const { data, error } = result;
        this.isLoading = false;
        if (data) {
            this.students = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.students = undefined;
        }
    }

    connectedCallback() {
        this.subscription = subscribe(
            this.messageContext,
            STUDENT_MESSAGE_CHANNEL,
            (message) => this.handleMessage(message)
        );
    }

    handleMessage(message) {
        console.log('Message đã nhận là:', message);
        if (message.studentAdded) {
            refreshApex(this.wiredResult);
        }
    }
}
