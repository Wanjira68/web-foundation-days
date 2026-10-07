const loadButton = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const status = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

let users = [];
function renderUsers(list) {
    usersList.innerHTML = "";

    list.forEach(function(user) {
        const listItem = document.createElement("li");

        const name = document.createElement("h2");
        name.textContent = user.name;

        const email = document.createElement("p");
        email.textContent = `Email: ${user.email}`;

        const city = document.createElement("p");
        city.textContent = `City: ${user.address.city}`;

        const company = document.createElement("p");
        company.textContent = `Company: ${user.company.name}`;

        listItem.appendChild(name);
        listItem.appendChild(email);
        listItem.appendChild(city);
        listItem.appendChild(company);

        usersList.appendChild(listItem);
    });
}
async function loadUsers() {
    status.textContent = "Loading users...";
    loadButton.disabled = true;

    try {
       const response = await fetch("https://jsonplaceholder.typicode.com/users");

        if (!response.ok) {
            throw new Error("Failed to load users.");
        }

        users = await response.json();

        renderUsers(users);

        status.textContent = "Users loaded successfully.";
    } catch (error) {
        status.textContent = "Error loading users.";
    } finally {
        loadButton.disabled = false;
    }
}
loadButton.addEventListener("click", loadUsers);
filterInput.addEventListener("input", function() {
    const searchText = filterInput.value.toLowerCase();

    const filteredUsers = users.filter(function(user) {
        return user.name.toLowerCase().includes(searchText);
    });

    renderUsers(filteredUsers);

    if (filteredUsers.length === 0) {
        usersList.innerHTML = "";
        
        const noResults = document.createElement("li");
        noResults.textContent = "No users match your filter.";
        
        usersList.appendChild(noResults);
    }
});