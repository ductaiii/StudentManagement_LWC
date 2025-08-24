import { LightningElement, track, wire } from 'lwc';
import { publish, subscribe, MessageContext } from 'lightning/messageService';
import addStudent from '@salesforce/apex/StudentController.addStudent';
import updateStudent from '@salesforce/apex/StudentController.updateStudent';
import deleteStudent from '@salesforce/apex/StudentController.deleteStudent';
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
    @track isEditMode = false;
    @track currentId = '';

    classOptions = [];
    statusOptions = [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' }
    ];

    @wire(MessageContext)
    messageContext;
    subscription = null;

    connectedCallback() {
        for (let grade = 10; grade <= 12; grade++) {
            for (let section = 1; section <= 3; section++) {
                const classLabel = `${grade}A${section}`;
                this.classOptions.push({ label: classLabel, value: classLabel });
            }
        }
        // Subscribe LMS để nhận dữ liệu edit/delete
        this.subscription = subscribe(
            this.messageContext,
            STUDENT_MESSAGE_CHANNEL,
            (message) => this.handleMessage(message)
        );
    }

    handleMessage(message) {
        if (message.studentEdit) {
            const stu = message.studentEdit;
            this.currentId = stu.Id;
            this.name = stu.Name;
            this.email = stu.Email__c;
            this.dateOfBirth = stu.Date_of_Birth__c;
            this.className = stu.Class__c;
            this.status = stu.Status__c;
            this.isEditMode = true;
            this.successMessage = '';
            this.errorMessage = '';
        } else if (message.studentDelete) {
            const stu = message.studentDelete;
            this.handleDeleteStudent(stu.Id);
        }
    }

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
            this.clearForm();
            publish(this.messageContext, STUDENT_MESSAGE_CHANNEL, { studentAdded: true });
        })
        .catch(error => {
            this.errorMessage = error.body ? error.body.message : error.message;
        })
        .finally(() => {
            this.isLoading = false;
        });
    }

    handleEditStudent() {
        this.isLoading = true;
        this.successMessage = '';
        this.errorMessage = '';
        updateStudent({
            studentId: this.currentId,
            name: this.name,
            email: this.email,
            dateOfBirth: this.dateOfBirth,
            className: this.className,
            status: this.status
        })
        .then(() => {
            this.successMessage = 'Student updated successfully!';
            this.clearForm();
            publish(this.messageContext, STUDENT_MESSAGE_CHANNEL, { studentAdded: true });
        })
        .catch(error => {
            this.errorMessage = error.body ? error.body.message : error.message;
        })
        .finally(() => {
            this.isLoading = false;
        });
    }

    handleDeleteStudent(id) {
        this.isLoading = true;
        this.successMessage = '';
        this.errorMessage = '';
        deleteStudent({ studentId: id })
        .then(() => {
            this.successMessage = 'Student deleted successfully!';
            this.clearForm();
            publish(this.messageContext, STUDENT_MESSAGE_CHANNEL, { studentAdded: true });
        })
        .catch(error => {
            this.errorMessage = error.body ? error.body.message : error.message;
        })
        .finally(() => {
            this.isLoading = false;
        });
    }

    handleDeleteStudentClick() {
        if (this.currentId) {
            this.handleDeleteStudent(this.currentId);
        } else {
            this.errorMessage = 'Student ID not found!';
        }
    }

    handleCancelEdit() {
        this.clearForm();
    }

    clearForm() {
        this.name = '';
        this.email = '';
        this.dateOfBirth = '';
        this.className = '';
        this.status = '';
        this.isEditMode = false;
        this.currentId = '';
    }
}