let notes = [
	{ id: 1, text: "Buy milk and bread", category: "personal" },
	{ id: 2, text: "Finish the Day 3 assignment", category: "study" },
	{ id: 3, text: "Email the project report to Grace", category: "work" },
	{ id: 4, text: "Revise JavaScript arrays", category: "study" },
	{ id: 5, text: "Call mum", category: "personal" },
];


function searchNotes(word) {
    return notes.filter(note => {
        return note.text.toLowerCase().includes(word.toLowerCase());
    });
}

console.log(searchNotes("JavaScript"));
console.log(searchNotes("pizza")); // Expected: []
function longestNote() {
    if (notes.length === 0) {
        return null;
    }
    let longest = notes[0];
    for (let note of notes) {
        if (note.text.length > longest.text.length) {
    longest = note;
}
      }  
      return longest;
}
console.log(longestNote());
notes = [];
console.log(longestNote()); // Expected: null
notes = [
    { id: 1, text: "Buy milk and bread", category: "personal" },
    { id: 2, text: "Finish the Day 3 assignment", category: "study" },
    { id: 3, text: "Email the project report to Grace", category: "work" },
    { id: 4, text: "Revise JavaScript arrays", category: "study" },
    { id: 5, text: "Call mum", category: "personal" },
];
function countByCategory() {
   let counts = {}; 
   for (let note of notes) {
    if (counts[note.category]) {
    counts[note.category]++;
} else {
    counts[note.category] = 1;
}

}
return counts;

}
console.log(countByCategory());
notes = [];
console.log(countByCategory()); // Expected: {}
notes = [
    { id: 1, text: "Buy milk and bread", category: "personal" },
    { id: 2, text: "Finish the Day 3 assignment", category: "study" },
    { id: 3, text: "Email the project report to Grace", category: "work" },
    { id: 4, text: "Revise JavaScript arrays", category: "study" },
    { id: 5, text: "Call mum", category: "personal" },
];
function getSummary() {
    let counts = countByCategory();
    let total = notes.length;
    let noteWord = total === 1 ? "note" : "notes";
    return `${total} ${noteWord}: ${counts.personal || 0} personal, ${counts.work || 0} work, ${counts.study || 0} study.`;
    }
 console.log(getSummary());
 notes = [
    { id: 1, text: "Call mum", category: "personal" }
];

console.log(getSummary());
notes = [
    { id: 1, text: "Buy milk and bread", category: "personal" },
    { id: 2, text: "Finish the Day 3 assignment", category: "study" },
    { id: 3, text: "Email the project report to Grace", category: "work" },
    { id: 4, text: "Revise JavaScript arrays", category: "study" },
    { id: 5, text: "Call mum", category: "personal" },
];
function isDuplicate(text) {
    return notes.some(note => {
        return note.text.trim().toLowerCase() === text.trim().toLowerCase();
    });
}
console.log(isDuplicate("Call mum"));
console.log(isDuplicate("Buy pizza"));
function addNote(text, category) {
    if (isDuplicate(text)) {
    console.log("Note already exists.");
    return false;
}
if (text.length < 1 || text.length > 200) {
        console.log("Note text must be 1-200 characters.");
        return false;
    }
     if (!["personal", "work", "study"].includes(category)) {
        console.log("Invalid category.");
        return false;
    }
    let newNote = {
        id: notes.length + 1,
        text: text,
        category: category
    };

    notes.push(newNote);
    return true;
    
}
console.log(addNote("Buy eggs", "personal"));
console.log(addNote("Call mum", "personal"));
notes = [
    { id: 1, text: "Buy milk and bread", category: "personal" },
    { id: 2, text: "Finish the Day 3 assignment", category: "study" },
    { id: 3, text: "Email the project report to Grace", category: "work" },
    { id: 4, text: "Revise JavaScript arrays", category: "study" },
    { id: 5, text: "Call mum", category: "personal" },
];
console.log(addNote("Go jogging", "fitness"));