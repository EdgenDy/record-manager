# record-manager
In-memory storage of object-based record in JavaScript.

**Syntax:**

```js
const { recordManager } = require("./record-manager/record-manager");


// Create a auto incrementing id Record Sheet (a Table like storage of records that can be retrieved using indexes)
const student = recordManager.createRecordSheet("student", {
  idnum: "string",
  first_name: "string",
  last_name: "string"
});



// Adding new records to the record sheet
const studentIndex = student.addRecord({idnum: "ID001", first_name: "John", last_name: "Doe"});
// returned value: 1 - index of the record




// Retrieve the record at the index 1
const record = student.getRecordByIndex(1);




// Search multiple records
student.getRecordWhere({idnum: ["ID001", "ID002"]});
// returned value: an array containing zero or more records that matched the criteria



// Create a record sheet with reference to other record sheet
const enrollment = recordManager.createRecordSheet("enrollment", {
  student: "ref",
  subject: "string",
  dateEnrolled: "string"
});




// while adding new Record the record attribute name must matched the name of the referencing record sheet
// e.g. attribute 'student' referencing the 'student' record sheet that was previously created 
enrollment.addRecord({ student: 1, subject: "Gemoetry", dateEnrolled: "2024/01/01"});


// Retrieved a record that has reference to the other record sheet
// by default all references will be returned as the original value
// by turning the second argument to true, all references by the record
// will be fetched as well from their corresponding record sheet
const result = enrollment.getRecordByIndex(1, true);

console.log(result.student.idnum); // ID001



// Retrieving the record sheet by it's name and store to a variable.
const student1 = recordManager.getRecordSheetByName("student");



// Delete a record at the index 1
student.deleteRecord(1);
// returned value: true - if the record existed on the record otherwise false
```
