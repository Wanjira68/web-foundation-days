# Library Books API

This REST API allows users to manage books in a library.

## Endpoints

### 1. List all books

- **Method:** GET
- **Path:** `/books`
- **Description:** Returns a list of all books.
- **Success status:** `200 OK`

### 2. Get one book

- **Method:** GET
- **Path:** `/books/{id}`
- **Description:** Returns one book using its ID.
- **Success status:** `200 OK`

### 3. Create a book

- **Method:** POST
- **Path:** `/books`
- **Description:** Creates a new book.
- **Example request body:** `{"title":"Things Fall Apart","author":"Chinua Achebe"}`
- **Success status:** `201 Created`

### 4. Update a book

- **Method:** PUT
- **Path:** `/books/{id}`
- **Description:** Updates an existing book using its ID.
- **Example request body:** `{"title":"Things Fall Apart","author":"Chinua Achebe"}`
- **Success status:** `200 OK`

### 5. Delete a book

- **Method:** DELETE
- **Path:** `/books/{id}`
- **Description:** Deletes a book using its ID.
- **Success status:** `204 No Content`

### 6. List books by author

- **Method:** GET
- **Path:** `/books?author=Chinua%20Achebe`
- **Description:** Returns books written by the specified author using the author query parameter.
- **Success status:** `200 OK`

## Error Codes

### 400 Bad Request

- **Description:** The request contains invalid or missing data.
- **Example:** A POST request tries to create a book without a title.

### 404 Not Found

- **Description:** The requested book does not exist.
- **Example:** A GET request tries to retrieve `/books/999` when book 999 does not exist.