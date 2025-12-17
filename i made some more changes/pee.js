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

// --- SOUND HELPER WITH FADE ---
function playSound(file) {
  const audio = new Audio(file);
  audio.volume = 0; // start silent
  audio.play();

  // Fade in
  let fadeIn = setInterval(() => {
    if (audio.volume < 1.0) {
      audio.volume = Math.min(audio.volume + 0.1, 1.0);
    } else {
      clearInterval(fadeIn);
    }
  }, 50);

  // Fade out near the end
  audio.addEventListener("ended", () => {
    let fadeOut = setInterval(() => {
      if (audio.volume > 0.0) {
        audio.volume = Math.max(audio.volume - 0.1, 0.0);
      } else {
        clearInterval(fadeOut);
      }
    }, 50);
  });
}

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

// ===== Digits-only restriction for Roll Number search =====
if (searchInput) {
  searchInput.addEventListener("input", () => {
    searchInput.value = searchInput.value.replace(/\D/g, "");
  });
}

const updateSearchForm = document.getElementById("updateSearchForm");
const updateCancelBtn = document.getElementById("updateCancelBtn");
const updateResult = document.getElementById("updateResult");
const updateInput = document.getElementById("updateInput");

if (updateInput) {
  updateInput.addEventListener("input", () => {
    updateInput.value = updateInput.value.replace(/\D/g, "");
  });
}

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
  const overlayDiv = document.createElement('div');
  overlayDiv.className = "success-overlay";
  overlayDiv.innerHTML = `<span class="tick">✔</span><p>${message}</p>`;

  // Optional: force full-screen overlay if needed
  overlayDiv.style.position = "fixed";
  overlayDiv.style.top = "0";
  overlayDiv.style.left = "0";
  overlayDiv.style.width = "100%";
  overlayDiv.style.height = "100%";
  overlayDiv.style.zIndex = "999";

  const originalHTML = targetPanel.innerHTML;
  targetPanel.innerHTML = "";
  targetPanel.appendChild(overlayDiv);

  setTimeout(() => {
    targetPanel.innerHTML = originalHTML;
    if (restoreFn) restoreFn();
    showHome();
  }, 2000);
}

// ===== showOverlay that DOES NOT call showHome (keeps dynamic content) =====
function showOverlayNoHome(targetPanel, message, continueFn) {
  const overlayDiv = document.createElement("div");
  overlayDiv.className = "success-overlay";
  overlayDiv.innerHTML = `<span class='tick'>✔</span><p>${message}</p>`;
  const originalHTML = targetPanel.innerHTML;
  // temporarily replace content with overlay
  targetPanel.innerHTML = "";
  targetPanel.appendChild(overlayDiv);

  // after timeout: restore original content and call continueFn (but do NOT call showHome)
  setTimeout(() => {
    targetPanel.innerHTML = originalHTML;
    if (continueFn) continueFn();
    // NOTE: intentionally not calling showHome() here
  }, 1500);
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
  // Show the welcome capsule and hide forms
  capsulePanel.style.display = "block";
  formPanel.hidden = true;
  searchPanel.hidden = true;
  updatePanel.hidden = true;

  // Remove centered form-mode and restore left image & sidebar state
  if (mainSplit) mainSplit.classList.remove("form-mode");
  closeSidebar();

  const left = document.querySelector(".left-side");
  if (left) left.style.display = "";

  // Clear any dynamic content (records/auth/export) so it doesn't remain
  const dyn = document.getElementById("dynamicPanel");
  if (dyn) dyn.innerHTML = "";
}

function showForm() {
  // clear any dynamic content left behind (records/auth)
  const dyn = document.getElementById("dynamicPanel");
  if (dyn) dyn.innerHTML = "";

  capsulePanel.style.display = "none";
  formPanel.hidden = false;
  searchPanel.hidden = true;
  updatePanel.hidden = true;
  registerForm.reset();

  // layout: center the form and hide left side
  if (mainSplit) mainSplit.classList.add("form-mode");
  closeSidebar();
  const left = document.querySelector(".left-side");
  if (left) left.style.display = "none";
}

function showSearch() {
  const dyn = document.getElementById("dynamicPanel");
  if (dyn) dyn.innerHTML = "";

  capsulePanel.style.display = "none";
  formPanel.hidden = true;
  searchPanel.hidden = false;
  updatePanel.hidden = true;
  searchForm.reset();
  searchResult.innerHTML = "";

  if (mainSplit) mainSplit.classList.add("form-mode");
  closeSidebar();
  const left = document.querySelector(".left-side");
  if (left) left.style.display = "none";
}

function showUpdate() {
  const dyn = document.getElementById("dynamicPanel");
  if (dyn) dyn.innerHTML = "";

  capsulePanel.style.display = "none";
  formPanel.hidden = true;
  searchPanel.hidden = true;
  updatePanel.hidden = false;
  updateSearchForm.reset();
  updateResult.innerHTML = "";

  if (mainSplit) mainSplit.classList.add("form-mode");
  closeSidebar();
  const left = document.querySelector(".left-side");
  if (left) left.style.display = "none";
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
  playSound("sounds/ding.mp3");
}
if (registerForm) registerForm.addEventListener("submit", onSubmit);

function rebindFormEvents() {
  const newForm = document.getElementById("registerForm");
  const newCancelBtn = document.getElementById("cancelBtn");
  if (newForm) newForm.addEventListener("submit", onSubmit);
  if (newCancelBtn) newCancelBtn.addEventListener("click", showHome);
}

// ===== REAL-TIME VALIDATION (TEXT ERRORS UNDER INPUTS) =====

const nameEl = document.getElementById("fullName");
const rollEl = document.getElementById("rollNumber");
const semEl = document.getElementById("semester");
const emailEl = document.getElementById("email");
const phoneEl = document.getElementById("phone");
const deptEl = document.getElementById("department");

// Helper: show error
function setError(id, message) {
  document.getElementById(id).textContent = message;
}

// Helper: clear error
function clearError(id) {
  document.getElementById(id).textContent = "";
}

// FULL NAME — letters + spaces only
nameEl.addEventListener("input", function () {
  const v = this.value;
  if (!/^[A-Za-z\s]*$/.test(v)) {
    setError("nameError", "Name can contain letters only.");
    this.value = v.replace(/[^A-Za-z\s]/g, "");
  } else if (v.trim() === "") {
    setError("nameError", "Name cannot be empty.");
  } else {
    clearError("nameError");
  }
});

// ROLL NUMBER — letters + numbers
rollEl.addEventListener("input", function () {
  const v = this.value;
  if (!/^[A-Za-z0-9]*$/.test(v)) {
    setError("rollError", "Roll number must be alphanumeric.");
    this.value = v.replace(/[^A-Za-z0-9]/g, "");
  } else if (v.trim() === "") {
    setError("rollError", "Roll number cannot be empty.");
  } else {
    clearError("rollError");
  }
});

// EMAIL — check on blur
emailEl.addEventListener("blur", function () {
  const v = this.value.trim();
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (v === "") {
    setError("emailError", "Email cannot be empty.");
  } else if (!pattern.test(v)) {
    setError("emailError", "Invalid email format.");
  } else {
    clearError("emailError");
  }
});

// PHONE — digits only + length = 10
phoneEl.addEventListener("input", function () {
  const v = this.value;
  if (!/^[0-9]*$/.test(v)) {
    setError("phoneError", "Phone must contain digits only.");
    this.value = v.replace(/[^0-9]/g, "");
  } else if (this.value.length > 10) {
    setError("phoneError", "Phone cannot exceed 10 digits.");
    this.value = this.value.slice(0, 10);
  } else {
    clearError("phoneError");
  }
});

phoneEl.addEventListener("blur", function () {
  if (this.value.length !== 10) {
    setError("phoneError", "Phone must be exactly 10 digits.");
  }
});

// SEMESTER — required
semEl.addEventListener("blur", function () {
  if (this.value === "") {
    setError("semesterError", "Please select a semester.");
  } else {
    clearError("semesterError");
  }
});

// DEPARTMENT — required
deptEl.addEventListener("blur", function () {
  if (this.value === "") {
    setError("deptError", "Please select a department.");
  } else {
    clearError("deptError");
  }
});

// ===== Sidebar navigation =====
if (homeLink) homeLink.addEventListener("click", (e) => { e.preventDefault(); showHome(); });
if (registerLink) registerLink.addEventListener("click", (e) => { e.preventDefault(); showForm(); });
if (searchLink) searchLink.addEventListener("click", (e) => { e.preventDefault(); showSearch(); });
if (updateLink) updateLink.addEventListener("click", (e) => { e.preventDefault(); showUpdate(); });
const importLink = document.getElementById("importLink");
if (importLink) importLink.addEventListener("click", (e) => {
  e.preventDefault();
  importRecordsFromAPI();
});

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
            playSound("sounds/whoosh.mp3");
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
  const dyn = document.getElementById("dynamicPanel");
  if (!dyn) return;

  // Hide homepage capsule and other panels so auth appears centered
  capsulePanel.style.display = "none";
  formPanel.hidden = true;
  searchPanel.hidden = true;
  updatePanel.hidden = true;

  // Populate only the dynamicPanel (do NOT replace .right-side)
  dyn.innerHTML = `
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

  // Switch to centered form layout and hide the left image & close sidebar
  if (mainSplit) mainSplit.classList.add("form-mode");
  closeSidebar();
  const left = document.querySelector(".left-side");
  if (left) left.style.display = "none";

  // Bind the injected auth form
  const authForm = document.getElementById("authForm");
  const authCancelBtn = document.getElementById("authCancelBtn");

  if (authForm) {
    authForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const entered = document.getElementById("authInput").value;
      if (entered === DASHBOARD_PASSWORD) {
  showOverlayNoHome(dyn, "Access granted", () => {
    if (actionType === "Records") showRecordsCapsule();
    if (actionType === "Export Records") exportRecordsJSON();
  });
  playSound("sounds/ding.mp3");
} else {
  showErrorOverlay(dyn, "Access denied");
  playSound("sounds/buzz.mp3");
}
    });
  }

  if (authCancelBtn) {
    authCancelBtn.addEventListener("click", () => {
      // Clear dynamic panel, restore left image, remove form-mode and go home
      dyn.innerHTML = "";
      if (left) left.style.display = "";
      if (mainSplit) mainSplit.classList.remove("form-mode");
      showHome();
    });
  }
}

// ===== Records capsule with Edit/Delete =====
function showRecordsCapsule() {
  // Use the dynamicPanel to render records (do not replace .right-side)
  const dyn = document.getElementById("dynamicPanel");
  if (!dyn) return;

  const records = loadRecords();

  // If no records, show a popup and return home
  if (!records.length) {
    showPopup("No records available");
    showHome();
    return;
  }

  // Switch to centered form layout and hide left image & close sidebar
  if (mainSplit) mainSplit.classList.add("form-mode");
  closeSidebar();
  const left = document.querySelector(".left-side");
  if (left) left.style.display = "none";

  // Build HTML for records inside dynamicPanel (keeps other DOM intact)
  let html = `<div class="form-capsule"><h2>All Student Records</h2>`;
  records.forEach((s, idx) => {
    html += renderCard(s, true, idx);
  });
  html += `<div class="actions"><button class="secondary" id="recordsBackBtn">Back</button></div></div>`;

  dyn.innerHTML = html;

  // Back button: clear dynamicPanel and return home
  const backBtn = document.getElementById("recordsBackBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      dyn.innerHTML = "";
      if (left) left.style.display = "";
      if (mainSplit) mainSplit.classList.remove("form-mode");
      showHome();
    });
  }

  // Bind Edit/Delete on each card (delegated from rendered buttons)
  document.querySelectorAll(".editBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-index"), 10);
      const recs = loadRecords();
      const match = recs[idx];

      // populate form and switch to edit mode (same as your original logic)
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

  // Bind delete buttons
  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-index"), 10);
      showConfirmPopup(() => {
        const latest = loadRecords();
        latest.splice(idx, 1);
        saveAllRecords(latest);
        showOverlay(dyn, "Form deleted successfully!", showRecordsCapsule);
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
  showHome();
}

function importRecordsWithAjax() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "https://jsonplaceholder.typicode.com/users", true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const externalRecords = JSON.parse(xhr.responseText);

      const mappedRecords = externalRecords.map(user => ({
        name: user.name,
        roll: user.id.toString(),
        semester: "1",
        email: user.email,
        phone: user.phone,
        department: "Imported"
      }));

      const existing = loadRecords();
      const merged = existing.concat(mappedRecords);
      saveAllRecords(merged);

      showOverlay(document.getElementById("dynamicPanel"), "Records imported via AJAX!");
      playSound("sounds/ding.mp3");
    }
  };
  xhr.send();
}

// ===== imprt records with spinners =====
function importRecordsFromAPI() {
  const spinner = document.getElementById("spinner");
  spinner.style.display = "inline-block"; // show spinner

  const xhr = new XMLHttpRequest();
  xhr.open("GET", "https://jsonplaceholder.typicode.com/users", true);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      spinner.style.display = "none"; // hide spinner when done

      if (xhr.status === 200) {
        try {
          const externalRecords = JSON.parse(xhr.responseText);

          const mappedRecords = externalRecords.map(user => ({
            name: user.name,
            roll: user.id.toString(),
            semester: "1",
            email: user.email,
            phone: user.phone,
            department: "Imported"
          }));

          const existing = loadRecords();
          const merged = existing.concat(mappedRecords);
          saveAllRecords(merged);

          showOverlay(document.getElementById("dynamicPanel"), "Records imported via AJAX!");
          playSound("sounds/ding.mp3");

        } catch (err) {
          showErrorOverlay(document.getElementById("dynamicPanel"), "Import failed");
          playSound("sounds/buzz.mp3");
          console.error(err);
        }
      } else {
        showErrorOverlay(document.getElementById("dynamicPanel"), "Import failed");
        playSound("sounds/buzz.mp3");
      }
    }
  };

  xhr.send();
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
