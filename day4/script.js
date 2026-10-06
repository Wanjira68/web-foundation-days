const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");
function updateCounts() {
    const text = noteText.value;

    charCount.textContent = `${text.length} / 200 characters`;

    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    wordCount.textContent = `${words} words`;

    charCount.classList.remove("warning", "over");

    if (text.length > 200) {
        charCount.classList.add("over");
    } else if (text.length > 180) {
        charCount.classList.add("warning");
    }
}
noteText.addEventListener("input", updateCounts);
noteText.addEventListener("input", () => {
    localStorage.setItem("noteDraft", noteText.value);
});
const savedDraft = localStorage.getItem("noteDraft");

if (savedDraft !== null) {
    noteText.value = savedDraft;
}
updateCounts();
clearBtn.addEventListener("click", () => {
    noteText.value = "";
    localStorage.removeItem("noteDraft");
    updateCounts();
});
noteText.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        noteText.value = "";
        localStorage.removeItem("noteDraft");
        updateCounts();
    }
});
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "Light mode";
}
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        themeToggle.textContent = "Light mode";
        localStorage.setItem("theme", "dark");
    } else {
        themeToggle.textContent = "Dark mode";
        localStorage.setItem("theme", "light");
    }
});