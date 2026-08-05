// script.js
const form = document.getElementById("studentForm");
const studentIdInput = document.getElementById("studentId");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const courseInput = document.getElementById("course");
const emailInput = document.getElementById("email");
const notesInput = document.getElementById("notes");
const searchInput = document.getElementById("search");
const studentList = document.getElementById("studentList");
const emptyState = document.getElementById("emptyState");
const totalStudents = document.getElementById("totalStudents");
const totalCourses = document.getElementById("totalCourses");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const toggleThemeBtn = document.getElementById("toggleTheme");

const STORAGE_KEY = "cadastro_alunos_lista";
const THEME_KEY = "cadastro_alunos_tema";

let students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentSearch = "";

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function createId() {
  return Date.now().toString() + Math.random().toString(16).slice(2);
}

function resetForm() {
  form.reset();
  studentIdInput.value = "";
  submitBtn.textContent = "Salvar aluno";
  cancelEditBtn.hidden = true;
}

function fillForm(student) {
  studentIdInput.value = student.id;
  nameInput.value = student.name;
  ageInput.value = student.age;
  courseInput.value = student.course;
  emailInput.value = student.email;
  notesInput.value = student.notes || "";
  submitBtn.textContent = "Atualizar aluno";
  cancelEditBtn.hidden = false;
  document.getElementById("form-section").scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateStats(filteredStudents) {
  totalStudents.textContent = filteredStudents.length;

  const uniqueCourses = new Set(
    filteredStudents.map(student => student.course.trim().toLowerCase())
  );
  totalCourses.textContent = [...uniqueCourses].filter(Boolean).length;
}

function getFilteredStudents() {
  const term = currentSearch.trim().toLowerCase();

  if (!term) return students;

  return students.filter(student =>
    student.name.toLowerCase().includes(term) ||
    student.course.toLowerCase().includes(term) ||
    student.email.toLowerCase().includes(term)
  );
}

function renderStudents() {
  const filteredStudents = getFilteredStudents();
  studentList.innerHTML = "";

  updateStats(filteredStudents);

  if (filteredStudents.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  filteredStudents.forEach((student, index) => {
    const item = document.createElement("article");
    item.className = "student-item";
    item.style.animation = `rise 0.5s ease forwards`;
    item.style.animationDelay = `${index * 0.05}s`;
    item.innerHTML = `
      <div>
        <div class="student-top">
          <div>
            <div class="student-name">${student.name}</div>
            <div class="student-meta">
              <div><strong>Idade:</strong> ${student.age} anos</div>
              <div><strong>Curso:</strong> ${student.course}</div>
              <div><strong>E-mail:</strong> ${student.email}</div>
            </div>
          </div>
        </div>
        ${student.notes ? `<p class="student-notes">${student.notes}</p>` : ""}
      </div>
      <div class="student-actions">
        <button class="action-btn edit" data-action="edit" data-id="${student.id}" type="button">Editar</button>
        <button class="action-btn delete" data-action="delete" data-id="${student.id}" type="button">Excluir</button>
      </div>
    `;
    studentList.appendChild(item);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const studentData = {
    id: studentIdInput.value || createId(),
    name: nameInput.value.trim(),
    age: ageInput.value.trim(),
    course: courseInput.value.trim(),
    email: emailInput.value.trim(),
    notes: notesInput.value.trim()
  };

  if (!studentData.name || !studentData.age || !studentData.course || !studentData.email) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  const existingIndex = students.findIndex(student => student.id === studentData.id);

  if (existingIndex >= 0) {
    students[existingIndex] = studentData;
  } else {
    students.unshift(studentData);
  }

  saveStudents();
  renderStudents();
  resetForm();
});

cancelEditBtn.addEventListener("click", resetForm);

searchInput.addEventListener("input", (event) => {
  currentSearch = event.target.value;
  renderStudents();
});

studentList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { action, id } = button.dataset;
  const student = students.find(item => item.id === id);

  if (!student) return;

  if (action === "edit") {
    fillForm(student);
  }

  if (action === "delete") {
    const confirmed = confirm(`Deseja realmente excluir o aluno "${student.name}"?`);
    if (!confirmed) return;

    students = students.filter(item => item.id !== id);
    saveStudents();
    renderStudents();

    if (studentIdInput.value === id) {
      resetForm();
    }
  }
});

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  localStorage.setItem(THEME_KEY, theme);
}

toggleThemeBtn.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark");
  applyTheme(isDark ? "light" : "dark");
});

(function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    applyTheme(savedTheme);
    return;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
})();

renderStudents();
