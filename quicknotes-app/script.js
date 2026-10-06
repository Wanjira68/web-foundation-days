const noteForm = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const noteCategory = document.querySelector("#note-category");
const notesList = document.querySelector("#notes-list");
const errorMessage = document.querySelector("#error-message");
const noteCount = document.querySelector("#note-count");
const searchInput = document.querySelector("#search-input");
let notes = [];

function render(searchTerm = "") {
    notesList.innerHTML = "";
if (notes.length === 0) {
    noteCount.textContent = "You have no notes yet.";
} else if (notes.length === 1) {
    noteCount.textContent = "You have 1 note.";
} else {
    noteCount.textContent = `You have ${notes.length} notes.`;
}
   const filteredNotes = notes.filter(function(note) {
    return note.text.toLowerCase().includes(searchTerm.toLowerCase());
});

if (searchTerm !== "" && filteredNotes.length === 0) {
    const noResults = document.createElement("li");
    noResults.textContent = "No notes match your search.";
    notesList.appendChild(noResults);
    return;
}

filteredNotes.forEach(function(note) {
        const listItem = document.createElement("li");
        listItem.classList.add(`category-${note.category}`);

        const noteText = document.createElement("p");
        noteText.textContent = note.text;

        const categoryLabel = document.createElement("small");
        categoryLabel.textContent = `Category: ${note.category}`;

        const date = document.createElement("small");
        date.textContent = `Created: ${note.createdAt}`;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function() {
    notes = notes.filter(function(item) {
        return item.id !== note.id;
    });
    localStorage.setItem("quickNotes", JSON.stringify(notes));

    render();
});

        listItem.appendChild(noteText);
        listItem.appendChild(categoryLabel);
        listItem.appendChild(document.createElement("br"));
        listItem.appendChild(date);
        listItem.appendChild(document.createElement("br"));
        listItem.appendChild(deleteButton);

        notesList.appendChild(listItem);
    });
}

noteForm.addEventListener("submit", function(event) {
    event.preventDefault();
if (noteInput.value.trim() === "") {
    errorMessage.textContent = "Please type a note first.";
    return;
}
if (noteInput.value.length > 200) {
    errorMessage.textContent = "Notes must be 200 characters or fewer.";
    return;
}
errorMessage.textContent = "";

    const note = {
        id: Date.now(),
        text: noteInput.value,
        category: noteCategory.value,
        createdAt: new Date().toLocaleString()
    };

  notes.push(note);

localStorage.setItem("quickNotes", JSON.stringify(notes));

render();

    noteInput.value = "";
});
const savedNotes = localStorage.getItem("quickNotes");

if (savedNotes) {
    notes = JSON.parse(savedNotes);
}

render();
searchInput.addEventListener("input", function() {
    render(searchInput.value);
});