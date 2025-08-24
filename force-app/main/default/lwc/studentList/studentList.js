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

    // Search/filter state
    searchKey = '';
    filterClass = '';
    filterStatus = '';
    filteredStudents = [];

    classOptions = [
        { label: 'All Classes', value: '' },
        { label: '10A1', value: '10A1' },
        { label: '10A2', value: '10A2' },
        { label: '10A3', value: '10A3' },
        { label: '11A1', value: '11A1' },
        { label: '11A2', value: '11A2' },
        { label: '11A3', value: '11A3' },
        { label: '12A1', value: '12A1' },
        { label: '12A2', value: '12A2' },
        { label: '12A3', value: '12A3' }
    ];
    statusOptions = [
        { label: 'All Status', value: '' },
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' }
    ];

    @wire(MessageContext)
    messageContext;

    get hasStudents() {
        return this.students && this.students.length > 0;
    }
    get hasFilteredStudents() {
        return this.filteredStudents && this.filteredStudents.length > 0;
    }

    @wire(getStudents)
    wiredStudents(result) {
        this.wiredResult = result;
        const { data, error } = result;
        this.isLoading = false;
        if (data) {
            this.students = data;
            this.error = undefined;
            this.applyFilter();
        } else if (error) {
            this.error = error;
            this.students = undefined;
            this.filteredStudents = [];
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
        if (message.studentAdded) {
            refreshApex(this.wiredResult);
        }
    }

    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        if (action.name === 'edit') {
            publish(this.messageContext, STUDENT_MESSAGE_CHANNEL, { studentEdit: row });
        } else if (action.name === 'delete') {
            publish(this.messageContext, STUDENT_MESSAGE_CHANNEL, { studentDelete: row });
        }
    }

    handleSearchKeyChange(event) {
        this.searchKey = event.target.value;
        this.applyFilter();
    }
    handleClassFilterChange(event) {
        this.filterClass = event.detail.value;
        this.applyFilter();
    }
    handleStatusFilterChange(event) {
        this.filterStatus = event.detail.value;
        this.applyFilter();
    }

    applyFilter() {
        if (!this.students) {
            this.filteredStudents = [];
            return;
        }
        let result = [...this.students];
        // Search by name or email
        if (this.searchKey) {
            const key = this.searchKey.toLowerCase();
            result = result.filter(s =>
                (s.Name && s.Name.toLowerCase().includes(key)) ||
                (s.Email__c && s.Email__c.toLowerCase().includes(key))
            );
        }
        // Filter by class
        if (this.filterClass) {
            result = result.filter(s => s.Class__c === this.filterClass);
        }
        // Filter by status
        if (this.filterStatus) {
            result = result.filter(s => s.Status__c === this.filterStatus);
        }
        this.filteredStudents = result;
    }
}
