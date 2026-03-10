/* =========================
Service Worker Register
========================= */

if ('serviceWorker' in navigator) {
window.addEventListener('load', () => {
navigator.serviceWorker
.register('sw.js')
.then(() => console.log('Service Worker Registered'))
.catch(err => console.log('SW registration failed:', err));
});
}

/* =========================
Global State
========================= */

let notes = JSON.parse(localStorage.getItem("bibleNotesPro")) || [];
let currentType = "note";
let currentSearch = "";
let deferredPrompt = null;
let editingId = null;
let deleteTarget = null;

/* =========================
DOM Elements
========================= */

// open bible
function openBible(){
open('https://lubangabrian.neocities.org/bible/bible.html');
}

const sideDrawer = document.getElementById("sideDrawer");
const menuBtn = document.getElementById("menuBtn");
const closeDrawerBtn = document.getElementById("closeDrawerBtn");

const installBtn = document.getElementById("installBtn");

const settingsBtn = document.getElementById("settingsBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");

const addBtn = document.getElementById("addBtn");
const typeModal = document.getElementById("typeModal");
const editorModal = document.getElementById("editorModal");
const settingsModal = document.getElementById("settingsModal");

const cancelTypeBtn = document.getElementById("cancelTypeBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");

const saveBtn = document.getElementById("saveBtn");
const mainInput = document.getElementById("mainInput");
const editorTitle = document.getElementById("editorTitle");

const notesContainer = document.getElementById("notesContainer");
const scriptureList = document.getElementById("scripturesUsed");

const searchInput = document.getElementById("searchInput");
const themeSelect = document.getElementById("themeSelect");

/* DELETE MODAL ELEMENTS */

const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn = document.getElementById("cancelDelete");

/* =========================
Install Prompt
========================= */

window.addEventListener("beforeinstallprompt", (e) => {
e.preventDefault();
deferredPrompt = e;
installBtn.style.display = "block";
});

installBtn.addEventListener("click", async () => {
if (!deferredPrompt) return;
deferredPrompt.prompt();
await deferredPrompt.userChoice;
deferredPrompt = null;
installBtn.style.display = "none";
});

/* =========================
Drawer Controls
========================= */

menuBtn.addEventListener("click", () => {
sideDrawer.classList.add("active");
});

closeDrawerBtn.addEventListener("click", () => {
sideDrawer.classList.remove("active");
});

/* =========================
Modal Controls
========================= */

addBtn.addEventListener("click", () => {
editingId = null;
typeModal.style.display = "flex";
});

cancelTypeBtn.addEventListener("click", closeModals);
cancelEditBtn.addEventListener("click", closeModals);
closeSettingsBtn.addEventListener("click", closeModals);

window.addEventListener("click", (e) => {
if (e.target.classList.contains("modal")) {
closeModals();
}
});

function closeModals() {
typeModal.style.display = "none";
editorModal.style.display = "none";
settingsModal.style.display = "none";
}

/* =========================
Type Selection
========================= */

document.querySelectorAll("[data-type]").forEach(btn => {
btn.addEventListener("click", () => {
currentType = btn.dataset.type;
typeModal.style.display = "none";
editorModal.style.display = "flex";
editorTitle.textContent =
"Add " + currentType.charAt(0).toUpperCase() + currentType.slice(1);
mainInput.value = "";
mainInput.focus();
});
});

/* =========================
Notes Logic
========================= */

saveBtn.addEventListener("click", () => {

const content = mainInput.value.trim();
if (!content) return;

if (editingId) {

const note = notes.find(n => n.id === editingId);
note.content = content;

} else {

const newNote = {
  id: Date.now(),
  type: currentType,
  content: content,
  createdAt: new Date().toISOString()
};

notes.push(newNote);

}

syncStorage();
closeModals();
displayNotes();

});

/* =========================
DELETE PROMPT SYSTEM
========================= */

function openDeletePrompt(id){
deleteTarget = id;
deleteModal.classList.add("show");
}

cancelDeleteBtn.addEventListener("click", () => {
deleteModal.classList.remove("show");
deleteTarget = null;
});

confirmDeleteBtn.addEventListener("click", () => {

if(deleteTarget !== null){
notes = notes.filter(n => n.id !== deleteTarget);
syncStorage();
displayNotes();
}

deleteModal.classList.remove("show");
deleteTarget = null;

});

function syncStorage(){
localStorage.setItem("bibleNotesPro", JSON.stringify(notes));
}

/* =========================
Display Notes
========================= */

function displayNotes(){

notesContainer.innerHTML = "";
scriptureList.innerHTML = "";

const filtered = notes.filter(n =>
n.content.toLowerCase().includes(currentSearch) ||
n.type.toLowerCase().includes(currentSearch)
);

const scriptureSet = new Set();

filtered.forEach(note => {

const div = document.createElement("div");
div.className = `note-item item-${note.type}`;
div.draggable = true;
div.dataset.id = note.id;

const icons = {
  note: "description",
  heading: "title",
  scripture: "auto_stories",
  subheading: "format_underlined"
};

const iconSpan = document.createElement("span");
iconSpan.className = "material-symbols-outlined";
iconSpan.textContent = icons[note.type] || "description";

const contentDiv = document.createElement("div");
contentDiv.className = "note-content";
contentDiv.textContent = note.content;

const dateDiv = document.createElement("div");
dateDiv.style.fontSize = "0.7rem";
dateDiv.style.opacity = "0.6";
dateDiv.textContent = new Date(note.createdAt || note.id).toLocaleString();

const deleteSpan = document.createElement("span");
deleteSpan.className = "material-symbols-outlined delete-icon";
deleteSpan.textContent = "delete";

deleteSpan.addEventListener("click", () => {
  openDeletePrompt(note.id);
});

div.addEventListener("dblclick", () => {

  editingId = note.id;
  currentType = note.type;

  editorTitle.textContent = "Edit Note";
  mainInput.value = note.content;

  editorModal.style.display = "flex";
  mainInput.focus();

});

div.append(iconSpan, contentDiv, dateDiv, deleteSpan);

/* Drag Events */

div.addEventListener("dragstart", e => {
  e.dataTransfer.setData("text/plain", note.id);
});

div.addEventListener("dragover", e => {
  e.preventDefault();
});

div.addEventListener("drop", e => {

  e.preventDefault();

  const draggedId = Number(e.dataTransfer.getData("text/plain"));
  const targetId = note.id;

  const draggedIndex = notes.findIndex(n => n.id === draggedId);
  const targetIndex = notes.findIndex(n => n.id === targetId);

  const [moved] = notes.splice(draggedIndex, 1);
  notes.splice(targetIndex, 0, moved);

  syncStorage();
  displayNotes();

});

notesContainer.appendChild(div);

if (note.type === "scripture") {
  scriptureSet.add(note.content);
}

});

scriptureSet.forEach(scr => {
const li = document.createElement("li");
li.textContent = scr;
scriptureList.appendChild(li);
});

}

/* =========================
Search
========================= */

searchInput.addEventListener("input", (e) => {
currentSearch = e.target.value.toLowerCase();
displayNotes();
});

/* =========================
Import / Export
========================= */

exportBtn.addEventListener("click", () => {

const dataStr =
"data:text/json;charset=utf-8," +
encodeURIComponent(JSON.stringify(notes));

const a = document.createElement("a");
a.href = dataStr;
a.download = "bible_notes.json";
a.click();

});

importBtn.addEventListener("click", () => {

const input = document.createElement("input");
input.type = "file";
input.accept = "application/json";

input.onchange = e => {

const file = e.target.files[0];
const reader = new FileReader();
reader.readAsText(file);

reader.onload = event => {

  try{

    const imported = JSON.parse(event.target.result);

    if(Array.isArray(imported)){
      notes = imported;
      syncStorage();
      displayNotes();
    }else{
      alert("Invalid file format.");
    }

  }catch{
    alert("Invalid JSON file.");
  }

};

};

input.click();

});

/* =========================
Settings
========================= */

settingsBtn.addEventListener("click", () => {
sideDrawer.classList.remove("active");
settingsModal.style.display = "flex";
});

themeSelect.addEventListener("change", updateTheme);

function updateTheme(){

const choice = themeSelect.value;

if(choice === "system"){

const prefersDark =
  window.matchMedia("(prefers-color-scheme: dark)").matches;

document.body.setAttribute(
  "data-theme",
  prefersDark ? "dark" : "light"
);

}else{

document.body.setAttribute("data-theme", choice);

}

localStorage.setItem("appTheme", choice);

}

/* =========================
Initialize App
========================= */

window.addEventListener("load", () => {

const savedTheme = localStorage.getItem("appTheme") || "system";

themeSelect.value = savedTheme;

updateTheme();

displayNotes();

document.getElementById("splashScreen").style.display = "none";

});