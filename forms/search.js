// Get students array from localStorage
function getStudents() {
    const data = localStorage.getItem("students");
    return data ? JSON.parse(data) : [];
}

const form = document.getElementById("searchForm");
const resultBox = document.getElementById("resultBox");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    let key = document.getElementById("searchInput").value.trim().toLowerCase();

    const students = getStudents();

    // Array + String methods to filter records
    const filtered = students.filter(student =>
        student.name.toLowerCase().includes(key) ||
        student.roll.toLowerCase().includes(key) ||
        student.semester.toLowerCase().includes(key)
    );

    // Hide the search form completely
    form.style.display = "none";

    //  HIDE THE HEADING ALSO
    document.getElementById("searchHeading").style.display = "none";

    // Make results full screen
    resultBox.style.width = "90%";
    resultBox.style.maxWidth = "800px";

    if (filtered.length === 0) {
        resultBox.innerHTML = "<h2>No record found</h2>";
        return;
    }

    // Generate full-page result
    let output = `
        <h2>Student Details</h2>
    `;

    filtered.forEach(s => {
        output += `
            <div class="record">
                <p><strong>Name:</strong> ${s.name}</p>
                <p><strong>Roll:</strong> ${s.roll}</p>
                <p><strong>Semester:</strong> ${s.semester}</p>
                <p><strong>Email:</strong> ${s.email}</p>
                <p><strong>Phone:</strong> ${s.phone}</p>
                <p><strong>Department:</strong> ${s.dept}</p>
                <hr>
            </div>
        `;
    });

    resultBox.innerHTML = output;
});
