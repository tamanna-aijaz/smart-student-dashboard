// ---------- Utility Functions ----------

// Fetch existing students array from localStorage
function getStudents() {
    const data = localStorage.getItem("students");
    return data ? JSON.parse(data) : [];
}

// Save updated array to localStorage
function saveStudents(arr) {
    localStorage.setItem("students", JSON.stringify(arr));
}



// ---------- Form Submission ----------

const form = document.getElementById("studentForm");
const successModal = document.getElementById("successModal");
const closeBtn = document.getElementById("closeBtn");

form.addEventListener("submit", function (e) {
    e.preventDefault(); // prevent page reload

    // Get form field values (same IDs as your HTML)
    const name = document.getElementById("name").value.trim();
    const roll = document.getElementById("roll").value.trim();
    const semester = document.getElementById("semester").value;
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const dept = document.getElementById("dept").value.trim();

    // Create student object
    const studentData = {
        id: Date.now(), // unique ID
        name: name,
        roll: roll,
        semester: semester,
        email: email,
        phone: phone,
        dept: dept,
        addedOn: new Date().toISOString()
    };

    // Get existing data, push new student, save back
    const studentsArray = getStudents();
    studentsArray.push(studentData);
    saveStudents(studentsArray);

    // Show success modal
    successModal.style.display = "flex";

    // Reset form after saving
    form.reset();
});


// ---------- Close Modal ----------

closeBtn.addEventListener("click", function () {
    successModal.style.display = "none";
});
