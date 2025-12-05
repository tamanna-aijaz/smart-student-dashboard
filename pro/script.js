let students = [];

// Display Current Date & Time
function updateDateTime() {
  const now = new Date();
  document.getElementById("dateTime").textContent = now.toLocaleString();
}
setInterval(updateDateTime, 1000);

// Add Student (store only, no display)
document.getElementById("studentForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const rollNo = document.getElementById("rollNo").value;
  const name = document.getElementById("name").value;
  const semester = document.getElementById("semester").value;

  students.push({ rollNo, name, semester });
  alert("Student record stored successfully!");
  this.reset();
});

// Search Student (show details only when searched)
function searchStudent() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const resultDiv = document.getElementById("searchResult");
  resultDiv.innerHTML = "";

  const found = students.filter(s =>
    s.rollNo.toLowerCase().includes(query) ||
    s.name.toLowerCase().includes(query) ||
    s.semester.toLowerCase().includes(query)
  );

  if (found.length > 0) {
    found.forEach(s => {
      resultDiv.innerHTML += `
        <p><strong>Roll No:</strong> ${s.rollNo}</p>
        <p><strong>Name:</strong> ${s.name}</p>
        <p><strong>Semester:</strong> ${s.semester}</p>
        <hr>
      `;
    });
  } else {
    resultDiv.textContent = "No student found.";
  }
}

// Export to JSON
function exportToJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(students));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "students.json");
  dlAnchor.click();
}

// AJAX Fetch External JSON
$("#fetchData").click(function() {
  $.getJSON("https://jsonplaceholder.typicode.com/users", function(data) {
    $("#externalData").text(JSON.stringify(data, null, 2));
  });
});

// jQuery Enhancements
$("#highlightBtn").click(function() {
  $("#studentForm").css("background-color", "#ffffcc");
});
$("#fadeBtn").click(function() {
  $("#studentForm").fadeToggle();
});