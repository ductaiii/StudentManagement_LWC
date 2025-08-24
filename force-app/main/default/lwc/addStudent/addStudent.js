import { LightningElement, track, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import addStudent from '@salesforce/apex/StudentController.addStudent';
import STUDENT_MESSAGE_CHANNEL from '@salesforce/messageChannel/studentMessageChannel__c';

export default class AddStudent extends LightningElement {
    @track name = '';
    @track email = '';
    @track dateOfBirth = '';
    @track className = '';
    @track status = '';
    @track isLoading = false;
    @track successMessage = '';
    @track errorMessage = '';

    // classOptions từ 10A1,10A2,10A3 tới 12A3
    classOptions = [];
    connectedCallback() {
        for (let grade = 10; grade <= 12; grade++) {
            for (let section = 1; section <= 3; section++) {
                const classLabel = `${grade}A${section}`;
                this.classOptions.push({ label: classLabel, value: classLabel });
            }
        }
    }


    statusOptions = [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' }
    ];

    @wire(MessageContext)
    messageContext;

    handleNameChange(event) {
        this.name = event.target.value;
    }
    handleEmailChange(event) {
        this.email = event.target.value;
    }
    handleDateChange(event) {
        this.dateOfBirth = event.target.value;
    }
    handleClassChange(event) {
        this.className = event.target.value;
    }
    handleStatusChange(event) {
        this.status = event.detail.value;
    }

    handleAddStudent() {
        this.isLoading = true;
        this.successMessage = '';
        this.errorMessage = '';
        addStudent({
            name: this.name,
            email: this.email,
            dateOfBirth: this.dateOfBirth,
            className: this.className,
            status: this.status
        })
        .then(() => {
            this.successMessage = 'Student added successfully!';
            this.name = '';
            this.email = '';
            this.dateOfBirth = '';
            this.className = '';
            this.status = '';
            publish(this.messageContext, STUDENT_MESSAGE_CHANNEL, { studentAdded: true });
        })
        .catch(error => {
            this.errorMessage = error.body ? error.body.message : error.message;
        })
        .finally(() => {
            this.isLoading = false;
        });
    }
}