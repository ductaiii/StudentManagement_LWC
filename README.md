# Student Management LWC

A Salesforce Lightning Web Component project for managing students.

## Features
- Add new student
- View student list
- Update student information
- Delete student
- Search student by name/email
- Export student transcript as PDF (future feature)

## Components
- `studentList`: Display student list
- `studentForm`: Add / Edit student
- `studentDetail`: Show student detail
- `studentTranscript`: Show grades and export PDF (separate component)

## Tech Stack
- Salesforce LWC (HTML, JS, CSS)
- Apex (for CRUD logic)
- SOQL (query student data)
- jsPDF (for PDF export)

## How to Run
1. Clone repository
2. Deploy LWC and Apex classes to Salesforce org
3. Open Lightning App Builder
4. Drag and drop components into the page
