import { LightningElement, wire } from 'lwc';
import { subscribe, publish, MessageContext } from 'lightning/messageService';
import { refreshApex } from '@salesforce/apex';
import getStudents from '@salesforce/apex/StudentController.getStudents';
import STUDENT_MESSAGE_CHANNEL from '@salesforce/messageChannel/studentMessageChannel__c';

const COLUMNS = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Email', fieldName: 'Email__c', type: 'email' },
    { label: 'Date of Birth', fieldName: 'Date_of_Birth__c', type: 'date' },
    { label: 'Class', fieldName: 'Class__c' },
    { label: 'Status', fieldName: 'Status__c' },
    {
        type: 'action',
        typeAttributes: {
            rowActions: [
                { label: 'Edit', name: 'edit', iconName: 'utility:edit' },
                { label: 'Delete', name: 'delete', iconName: 'utility:delete' }
            ]
        }
    }
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

    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        if (action.name === 'edit') {
            // Publish LMS message để form nhận dữ liệu edit
            publish(this.messageContext, STUDENT_MESSAGE_CHANNEL, { studentEdit: row });
        } else if (action.name === 'delete') {
            // Publish LMS message để form nhận dữ liệu xoá
            publish(this.messageContext, STUDENT_MESSAGE_CHANNEL, { studentDelete: row });
        }
    }
}
