// Smart Student Dashboard - No database, pure front-end.
// Data persisted using localStorage to survive refresh (allowed per brief).

// --------------------------- State and utils ---------------------------
const state = {
  students: [],
  filters: { roll: "", name: "", semester: "" },
  sort: { key: null, dir: "asc" },
};

const els = {
  form: document.getElementById("studentForm"),
  roll: document.getElementById("roll"),
  name: document.getElementById("name"),
  semester: document.getElementById("semester"),
  email: document.getElementById("email"),
  phone: document.getElementById("phone"),
  dept: document.getElementById("dept"),

  searchRoll: document.getElementById("searchRoll"),
  searchName: document.getElementById("searchName"),
  filterSemester: document.getElementById("filterSemester"),
  btnClearFilters: document.getElementById("btnClearFilters"),
  btnSortNameAsc: document.getElementById("btnSortNameAsc"),
  btnSortNameDesc: document.getElementById("btnSortNameDesc"),

  tbody: document.getElementById("studentsTbody"),
  recordCount: document.getElementById("recordCount"),

  btnExportJSON: document.getElementById("btnExportJSON"),
  btnImportExternal: document.getElementById("btnImportExternal"),

  currentDate: document.getElementById("currentDate"),
  currentTime: document.getElementById("currentTime"),

  btnHighlightTop: document.getElementById("btnHighlightTop"),
  btnToggleTheme: document.getElementById("btnToggleTheme"),
  btnPulseTitle: document.getElementById("btnPulseTitle"),
};

function uid() {
  return "id_" + Math.random().toString(36).slice(2, 9);
}

function saveToLocal() {
  localStorage.setItem("students", JSON.stringify(state.students));
}

function loadFromLocal() {
  try {
    const raw = localStorage.getItem("students");
    state.students = raw ? JSON.parse(raw) : [];
  } catch {
    state.students = [];
  }
}

// --------------------------- Date & time ---------------------------
function updateDateTime() {
  const now = new Date();
  els.currentDate.textContent = now.toLocaleDateString();
  els.currentTime.textContent = now.toLocaleTimeString();
}
setInterval(updateDateTime, 1000);
updateDateTime();

// --------------------------- CRUD operations ---------------------------
function addStudent(s) {
  // simple validation example
  const exists = state.students.some(st => st.roll.toLowerCase() === s.roll.toLowerCase());
  if (exists) {
    alert("Roll No already exists. Please use a unique roll.");
    return false;
  }
  s.id = uid();
  state.students.push(s);
  saveToLocal();
  render();
  return true;
}

function updateStudent(id, patch) {
  const idx = state.students.findIndex(s => s.id === id);
  if (idx === -1) return;
  state.students[idx] = { ...state.students[idx], ...patch };
  saveToLocal();
  render();
}

function deleteStudent(id) {
  state.students = state.students.filter(s => s.id !== id);
  saveToLocal();
  render();
}

// --------------------------- Event handlers ---------------------------
// Form submit
els.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const s = {
    roll: els.roll.value.trim(),
    name: els.name.value.trim(),
    semester: els.semester.value.trim(),
    email: els.email.value.trim(),
    phone: els.phone.value.trim(),
    dept: els.dept.value.trim(),
  };
  if (!s.roll || !s.name || !s.semester) {
    alert("Roll, Name, and Semester are required.");
    return;
  }
  const ok = addStudent(s);
  if (ok) els.form.reset();
});

// Inline edit: delegate to tbody
els.tbody.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const id = btn.dataset.id;
  const action = btn.dataset.action;

  if (action === "delete") {
    if (confirm("Delete this record?")) deleteStudent(id);
  }

  if (action === "edit") {
    // turn row into editable inputs
    const tr = btn.closest("tr");
    toggleRowEdit(tr, id, true);
  }

  if (action === "save") {
    const tr = btn.closest("tr");
    const inputs = tr.querySelectorAll("input");
    const patch = {
      roll: inputs[0].value.trim(),
      name: inputs[1].value.trim(),
      semester: inputs[2].value.trim(),
      email: inputs[3].value.trim(),
      phone: inputs[4].value.trim(),
      dept: inputs[5].value.trim(),
    };
    updateStudent(id, patch);
  }

  if (action === "cancel") {
    render(); // re-render to exit edit mode
  }
});

// Search & filter
els.searchRoll.addEventListener("input", () => {
  state.filters.roll = els.searchRoll.value.trim().toLowerCase();
  render();
});
els.searchName.addEventListener("input", () => {
  state.filters.name = els.searchName.value.trim().toLowerCase();
  render();
});
els.filterSemester.addEventListener("change", () => {
  state.filters.semester = els.filterSemester.value.trim();
  render();
});
els.btnClearFilters.addEventListener("click", () => {
  state.filters = { roll: "", name: "", semester: "" };
  els.searchRoll.value = ""; els.searchName.value = ""; els.filterSemester.value = "";
  render();
});

// Sort
els.btnSortNameAsc.addEventListener("click", () => {
  state.sort = { key: "name", dir: "asc" }; render();
});
els.btnSortNameDesc.addEventListener("click", () => {
  state.sort = { key: "name", dir: "desc" }; render();
});

// Export JSON
els.btnExportJSON.addEventListener("click", () => {
  const dataStr = JSON.stringify(state.students, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "students.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// Import external JSON via jQuery AJAX
els.btnImportExternal.addEventListener("click", () => {
  // You can switch this to a public API that returns JSON array of students
  $.ajax({
    url: "sample-external.json",
    method: "GET",
    dataType: "json",
    success: function(data) {
      if (!Array.isArray(data)) {
        alert("External JSON must be an array of student objects.");
        return;
      }
      // Merge unique rolls
      const existingRolls = new Set(state.students.map(s => s.roll.toLowerCase()));
      const merged = data.filter(s => !existingRolls.has(String(s.roll).toLowerCase()))
                         .map(s => ({ ...s, id: uid() }));
      state.students = [...state.students, ...merged];
      saveToLocal();
      render();
      alert(`Imported ${merged.length} new records.`);
    },
    error: function() {
      alert("Failed to fetch external JSON. If running from file, start a local server.");
    }
  });
});

// jQuery enhancements
$("#btnHighlightTop").on("click", function () {
  // Example: highlight top 3 by highest semester
  const sorted = [...state.students].sort((a, b) => Number(b.semester) - Number(a.semester));
  const top = sorted.slice(0, 3).map(s => s.id);
  $("#studentsTbody tr").each(function () {
    const id = $(this).data("id");
    $(this).toggleClass("highlight", top.includes(id));
  });
});

$("#btnToggleTheme").on("click", function () {
  $("html, body").toggleClass("theme-light");
});

$("#btnPulseTitle").on("click", function () {
  $("header h1").addClass("pulse");
  setTimeout(() => $("header h1").removeClass("pulse"), 950);
});

// --------------------------- Rendering ---------------------------
function getFilteredSortedStudents() {
  let list = [...state.students];

  // Filter by roll
  if (state.filters.roll) {
    list = list.filter(s => String(s.roll).toLowerCase().includes(state.filters.roll));
  }
  // Filter by name
  if (state.filters.name) {
    list = list.filter(s => String(s.name).toLowerCase().includes(state.filters.name));
  }
  // Filter by semester
  if (state.filters.semester) {
    list = list.filter(s => String(s.semester) === state.filters.semester);
  }

  // Sort
  if (state.sort.key === "name") {
    list.sort((a, b) => {
      const x = a.name.toLowerCase(), y = b.name.toLowerCase();
      if (x < y) return state.sort.dir === "asc" ? -1 : 1;
      if (x > y) return state.sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }

  return list;
}

function render() {
  const rows = getFilteredSortedStudents().map(studentRowHTML).join("");
  els.tbody.innerHTML = rows;
  // Set data-id to each row for jQuery highlighting
  [...els.tbody.querySelectorAll("tr")].forEach(tr => {
    tr.dataset.id = tr.getAttribute("data-id");
  });
  els.recordCount.textContent = `${getFilteredSortedStudents().length} record(s) shown`;
}

function studentRowHTML(s) {
  return `
    <tr data-id="${s.id}">
      <td>${escapeHTML(s.roll)}</td>
      <td>${escapeHTML(s.name)}</td>
      <td><span class="badge">${escapeHTML(s.semester)}</span></td>
      <td>${escapeHTML(s.email || "")}</td>
      <td>${escapeHTML(s.phone || "")}</td>
      <td>${escapeHTML(s.dept || "")}</td>
      <td>
        <button class="btn" data-action="edit" data-id="${s.id}">Edit</button>
        <button class="btn" data-action="delete" data-id="${s.id}">Delete</button>
      </td>
    </tr>
  `;
}

function toggleRowEdit(tr, id, editing) {
  const s = state.students.find(x => x.id === id);
  if (!s || !editing) return render();

  tr.innerHTML = `
    <td><input value="${escapeAttr(s.roll)}" /></td>
    <td><input value="${escapeAttr(s.name)}" /></td>
    <td><input value="${escapeAttr(s.semester)}" /></td>
    <td><input value="${escapeAttr(s.email || "")}" /></td>
    <td><input value="${escapeAttr(s.phone || "")}" /></td>
    <td><input value="${escapeAttr(s.dept || "")}" /></td>
    <td>
      <button class="btn primary" data-action="save" data-id="${s.id}">Save</button>
      <button class="btn" data-action="cancel" data-id="${s.id}">Cancel</button>
    </td>
  `;
}

// Simple XSS-safe escaping
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function escapeAttr(str) {
  return escapeHTML(str);
}

// Bootstrap
loadFromLocal();
// Seed demo data if empty
if (state.students.length === 0) {
  state.students = [
    { id: uid(), roll: "23CA041", name: "Sadiya", semester: "3", email: "sadiya@example.com", phone: "7000xxxxx1", dept: "Computer Applications" },
    { id: uid(), roll: "23CA042", name: "Ayaan", semester: "4", email: "ayaan@example.com", phone: "7000xxxxx2", dept: "Computer Applications" },
    { id: uid(), roll: "23CA043", name: "Iqra", semester: "2", email: "iqra@example.com", phone: "7000xxxxx3", dept: "Computer Applications" }
  ];
  saveToLocal();
}
render();