// ===== Top bar: live date/time =====
function updateDateTime() {
  const el = document.getElementById("datetime");
  if (!el) return;
  const now = new Date();
  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  };
  el.textContent = new Intl.DateTimeFormat("en-IN", options).format(now);
}
setInterval(updateDateTime, 1000);
updateDateTime();

// ===== Sidebar toggle =====
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    sidebar.classList.add("open");
    overlay.classList.add("show");
  });
}
if (overlay) {
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  });
}

// ===== Panels =====
const mainSplit = document.getElementById("mainSplit");
const capsulePanel = document.getElementById("capsulePanel");
const formPanel = document.getElementById("formPanel");
const searchPanel = document.getElementById("searchPanel");
const updatePanel = document.getElementById("updatePanel");

// ===== Forms and buttons =====
const showFormBtn = document.getElementById("showFormBtn");
const registerForm = document.getElementById("registerForm");
const cancelBtn = document.getElementById("cancelBtn");

const searchForm = document.getElementById("searchForm");
const searchCancelBtn = document.getElementById("searchCancelBtn");
const searchResult = document.getElementById("searchResult");
const searchInput = document.getElementById("searchInput");

const updateSearchForm = document.getElementById("updateSearchForm");
const updateCancelBtn = document.getElementById("updateCancelBtn");
const updateResult = document.getElementById("updateResult");
const updateInput = document.getElementById("updateInput");

// ===== Navigation links =====
const homeLink = document.getElementById("homeLink");
const registerLink = document.getElementById("registerLink");
const searchLink = document.getElementById("searchLink");
const updateLink = document.getElementById("updateLink");
const recordsLink = document.getElementById("recordsLink");
const exportLink = document.getElementById("exportLink");

// ===== Password constant =====
const DASHBOARD_PASSWORD = "admin123";

// ===== LocalStorage helpers =====
function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem("students")) || [];
  } catch {
    return [];
  }
}
function saveRecord(student) {
  const records = loadRecords();
  records.push(student);
  localStorage.setItem("students", JSON.stringify(records));
}
function saveAllRecords(records) {
  localStorage.setItem("students", JSON.stringify(records));
}

// ===== Popups & cards =====
function showPopup(message) {
  const popup = document.createElement("div");
  popup.className = "no-record-popup";
  popup.textContent = message;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 2000);
}

function showConfirmPopup(onYes, onNo) {
  const popup = document.createElement("div");
  popup.className = "confirm-popup";
  popup.innerHTML = `
    <p>Are you sure you want to delete this record?</p>
    <div class="actions">
      <button class="primary" id="confirmYes">Yes</button>
      <button class="secondary" id="confirmNo">No</button>
    </div>
  `;
  document.body.appendChild(popup);
  document.getElementById("confirmYes").addEventListener("click", () => {
    popup.remove();
    onYes();
  });
  document.getElementById("confirmNo").addEventListener("click", () => {
    popup.remove();
    if (onNo) onNo();
  });
}

function renderCard(match, includeUpdateActions = false, idx = null) {
  return `
    <div class="search-result-card">
      <h3>Student Details</h3>
      <p><strong>Name:</strong> ${match.name}</p>
      <p><strong>Roll Number:</strong> ${match.roll}</p>
      <p><strong>Semester:</strong> ${match.semester}</p>
      <p><strong>Email:</strong> ${match.email}</p>
      <p><strong>Phone:</strong> ${match.phone}</p>
      <p><strong>Department:</strong> ${match.department}</p>
      ${includeUpdateActions ? `
        <div class="update-actions">
          <button class="editBtn" data-index="${idx}">Edit</button>
          <button class="deleteBtn" data-index="${idx}">Delete</button>
        </div>
      ` : ``}
    </div>
  `;
}

// ===== Success overlays =====
function showOverlay(targetPanel, message, restoreFn) {
  const overlayDiv = document.createElement("div");
  overlayDiv.className = "success-overlay";
  overlayDiv.innerHTML = `<span class='tick'>✔</span><p>${message}</p>`;
  const originalHTML = targetPanel.innerHTML;
  targetPanel.innerHTML = "";
  targetPanel.appendChild(overlayDiv);
  setTimeout(() => {
    targetPanel.innerHTML = originalHTML;
    if (restoreFn) restoreFn();
    showHome();
  }, 2000);
}
function showErrorOverlay(targetPanel, message) {
  const overlayDiv = document.createElement("div");
  overlayDiv.className = "success-overlay";
  overlayDiv.innerHTML = `<span style="font-size:3rem;color:red;">✖</span><p>${message}</p>`;
  const originalHTML = targetPanel.innerHTML;
  targetPanel.innerHTML = "";
  targetPanel.appendChild(overlayDiv);
  setTimeout(() => {
    targetPanel.innerHTML = originalHTML;
    showHome();
  }, 2000);
}

// ===== View switching =====
function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
}
function showHome() {
  capsulePanel.style.display = "block";
  formPanel.hidden = true;
  searchPanel.hidden = true;
  updatePanel.hidden = true;
  mainSplit.classList.remove("form-mode");
  closeSidebar();
}
function showForm() {
  capsulePanel.style.display = "none";
  formPanel.hidden = false;
  searchPanel.hidden = true;
  updatePanel.hidden = true;
  registerForm.reset();
  mainSplit.classList.add("form-mode");
  closeSidebar();
}
function showSearch() {
  capsulePanel.style.display = "none";
  formPanel.hidden = true;
  searchPanel.hidden = false;
  updatePanel.hidden = true;
  searchForm.reset();
  searchResult.innerHTML = "";
  mainSplit.classList.add("form-mode");
  closeSidebar();
}
function showUpdate() {
  capsulePanel.style.display = "none";
  formPanel.hidden = true;
  searchPanel.hidden = true;
  updatePanel.hidden = false;
  updateSearchForm.reset();
  updateResult.innerHTML = "";
  mainSplit.classList.add("form-mode");
  closeSidebar();
}

// ===== Registration =====
if (showFormBtn) showFormBtn.addEventListener("click", showForm);
if (cancelBtn) cancelBtn.addEventListener("click", showHome);

function onSubmit(e) {
  e.preventDefault();
  const student = {
    name: document.getElementById("fullName").value.trim(),
    roll: document.getElementById("rollNumber").value.trim(),
    semester: document.getElementById("semester").value,
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    department: document.getElementById("department").value
  };
  saveRecord(student);
  registerForm.reset();
  showOverlay(formPanel, "Form submitted successfully!", rebindFormEvents);
}
if (registerForm) registerForm.addEventListener("submit", onSubmit);

function rebindFormEvents() {
  const newForm = document.getElementById("registerForm");
  const newCancelBtn = document.getElementById("cancelBtn");
  if (newForm) newForm.addEventListener("submit", onSubmit);
  if (newCancelBtn) newCancelBtn.addEventListener("click", showHome);
}

// ===== Sidebar navigation =====
if (homeLink) homeLink.addEventListener("click", (e) => { e.preventDefault(); showHome(); });
if (registerLink) registerLink.addEventListener("click", (e) => { e.preventDefault(); showForm(); });
if (searchLink) searchLink.addEventListener("click", (e) => { e.preventDefault(); showSearch(); });
if (updateLink) updateLink.addEventListener("click", (e) => { e.preventDefault(); showUpdate(); });

// ===== Search logic =====
if (searchCancelBtn) searchCancelBtn.addEventListener("click", showHome);

if (searchForm) {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim().toLowerCase();
    const records = loadRecords();
    const match = records.find(
      (s) => (s.name && s.name.toLowerCase() === query) || (s.roll && s.roll.toLowerCase() === query)
    );
    if (match) {
      searchResult.innerHTML = renderCard(match);
    } else {
      searchResult.innerHTML = "";
      showPopup("No record found");
    }
  });
}

// ===== Update logic =====
if (updateCancelBtn) updateCancelBtn.addEventListener("click", showHome);

if (updateSearchForm) {
  updateSearchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = updateInput.value.trim().toLowerCase();
    const records = loadRecords();
    const matchIndex = records.findIndex(
      (s) => (s.name && s.name.toLowerCase() === query) || (s.roll && s.roll.toLowerCase() === query)
    );
    if (matchIndex >= 0) {
      const match = records[matchIndex];
      updateResult.innerHTML = renderCard(match, true, matchIndex);

      const editBtn = document.querySelector(".editBtn");
      const deleteBtn = document.querySelector(".deleteBtn");

      // Edit flow
      if (editBtn) {
        editBtn.addEventListener("click", () => {
          showForm();
          document.getElementById("fullName").value = match.name;
          document.getElementById("rollNumber").value = match.roll;
          document.getElementById("semester").value = match.semester;
          document.getElementById("email").value = match.email;
          document.getElementById("phone").value = match.phone;
          document.getElementById("department").value = match.department;

          const actions = formPanel.querySelector(".actions");
          const originalActionsHTML = actions.innerHTML;
          actions.innerHTML = `
            <button type="submit" class="primary" id="saveChangesBtn">Save Changes</button>
            <button type="button" class="secondary" id="cancelChangesBtn">Cancel</button>
          `;

          function saveHandler(ev) {
            ev.preventDefault();
            const latest = loadRecords();
            latest[matchIndex] = {
              name: document.getElementById("fullName").value.trim(),
              roll: document.getElementById("rollNumber").value.trim(),
              semester: document.getElementById("semester").value,
              email: document.getElementById("email").value.trim(),
              phone: document.getElementById("phone").value.trim(),
              department: document.getElementById("department").value
            };
            saveAllRecords(latest);
            actions.innerHTML = originalActionsHTML;
            registerForm.removeEventListener("submit", saveHandler);
            registerForm.addEventListener("submit", onSubmit);
            showOverlay(formPanel, "Form updated successfully!", rebindFormEvents);
          }

          registerForm.removeEventListener("submit", onSubmit);
          registerForm.addEventListener("submit", saveHandler);

          const cancelBtnEdit = document.getElementById("cancelChangesBtn");
          if (cancelBtnEdit) {
            cancelBtnEdit.addEventListener("click", () => {
              actions.innerHTML = originalActionsHTML;
              registerForm.removeEventListener("submit", saveHandler);
              registerForm.addEventListener("submit", onSubmit);
              showHome();
            });
          }
        });
      }

      // Delete flow
      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          showConfirmPopup(() => {
            const latest = loadRecords();
            latest.splice(matchIndex, 1);
            saveAllRecords(latest);
            showOverlay(updatePanel, "Form deleted successfully!");
            updateResult.innerHTML = "";
          });
        });
      }
    } else {
      updateResult.innerHTML = "";
      showPopup("No record found");
    }
  });
}

// ===== Auth prompt (Records / Export) =====
function showPasswordPrompt(actionType) {
  capsulePanel.style.display = "none";
  formPanel.hidden = true;
  searchPanel.hidden = true;
  updatePanel.hidden = true;

  const rightSide = document.querySelector(".right-side");
  rightSide.innerHTML = `
    <div class="form-capsule">
      <h2>${actionType} Authentication</h2>
      <form id="authForm" autocomplete="off">
        <label for="authInput">Enter Password</label>
        <input id="authInput" type="password" placeholder="Password" required />
        <div class="actions">
          <button type="submit" class="primary">Submit</button>
          <button type="button" class="secondary" id="authCancelBtn">Cancel</button>
        </div>
      </form>
    </div>
  `;

  const authForm = document.getElementById("authForm");
  const authCancelBtn = document.getElementById("authCancelBtn");

  authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const entered = document.getElementById("authInput").value;
    if (entered === DASHBOARD_PASSWORD) {
      showOverlay(rightSide, "Access granted", () => {
        if (actionType === "Records") showRecordsCapsule();
        if (actionType === "Export Records") exportRecordsJSON();
      });
    } else {
      showErrorOverlay(rightSide, "Access denied");
    }
  });

  authCancelBtn.addEventListener("click", showHome);
}

// ===== Records capsule with Edit/Delete =====
function showRecordsCapsule() {
  const records = loadRecords();
  const rightSide = document.querySelector(".right-side");

  if (!records.length) {
    showPopup("No records available");
    showHome();
    return;
  }

  let html = `<div class="form-capsule"><h2>All Student Records</h2>`;
  records.forEach((s, idx) => {
    html += renderCard(s, true, idx);
  });
  html += `<div class="actions"><button class="secondary" id="recordsBackBtn">Back</button></div></div>`;
  rightSide.innerHTML = html;

  const backBtn = document.getElementById("recordsBackBtn");
  if (backBtn) backBtn.addEventListener("click", showHome);

  // Bind Edit/Delete on each card
  document.querySelectorAll(".editBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-index"), 10);
      const recs = loadRecords();
      const match = recs[idx];

      showForm();
      document.getElementById("fullName").value = match.name;
      document.getElementById("rollNumber").value = match.roll;
      document.getElementById("semester").value = match.semester;
      document.getElementById("email").value = match.email;
      document.getElementById("phone").value = match.phone;
      document.getElementById("department").value = match.department;

      const actions = formPanel.querySelector(".actions");
      const originalActionsHTML = actions.innerHTML;
      actions.innerHTML = `
        <button type="submit" class="primary" id="saveChangesBtn">Save Changes</button>
        <button type="button" class="secondary" id="cancelChangesBtn">Cancel</button>
      `;

      function saveHandler(ev) {
        ev.preventDefault();
        const latest = loadRecords();
        latest[idx] = {
          name: document.getElementById("fullName").value.trim(),
          roll: document.getElementById("rollNumber").value.trim(),
          semester: document.getElementById("semester").value,
          email: document.getElementById("email").value.trim(),
          phone: document.getElementById("phone").value.trim(),
          department: document.getElementById("department").value
        };
        saveAllRecords(latest);
        actions.innerHTML = originalActionsHTML;
        registerForm.removeEventListener("submit", saveHandler);
        registerForm.addEventListener("submit", onSubmit);
        showOverlay(formPanel, "Form updated successfully!", rebindFormEvents);
      }

      registerForm.removeEventListener("submit", onSubmit);
      registerForm.addEventListener("submit", saveHandler);

      const cancelBtnEdit = document.getElementById("cancelChangesBtn");
      if (cancelBtnEdit) {
        cancelBtnEdit.addEventListener("click", () => {
          actions.innerHTML = originalActionsHTML;
          registerForm.removeEventListener("submit", saveHandler);
          registerForm.addEventListener("submit", onSubmit);
          showHome();
        });
      }
    });
  });

  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-index"), 10);
      showConfirmPopup(() => {
        const latest = loadRecords();
        latest.splice(idx, 1);
        saveAllRecords(latest);
        showOverlay(rightSide, "Form deleted successfully!", showRecordsCapsule);
      });
    });
  });
}

// ===== Export records (JSON) =====
function exportRecordsJSON() {
  const records = loadRecords();
  if (!records.length) {
    showPopup("No records available");
    showHome();
    return;
  }
  const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "students.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const rightSide = document.querySelector(".right-side");
  showOverlay(rightSide, "Records downloaded successfully!");
}

// ===== Hook up Records and Export with auth =====
if (recordsLink) {
  recordsLink.addEventListener("click", (e) => {
    e.preventDefault();
    showPasswordPrompt("Records");
  });
}
if (exportLink) {
  exportLink.addEventListener("click", (e) => {
    e.preventDefault();
    showPasswordPrompt("Export Records");
  });
}

// ===== Initial state =====
showHome();
