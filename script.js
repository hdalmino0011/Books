// Book class
class Book {
  constructor(title, author, genre) {
    this.title = title;
    this.author = author;
    this.genre = genre;
  }
}
// UI class
class UI {
  static displayBooks() {
    const books = Store.getBooks();
    books.forEach((book) => UI.addBookToList(book));
  }
  static addBookToList(book) {
    const list = document.getElementById("book-list");
    const row = document.createElement("div");
    row.classList.add("book");
    row.innerHTML = `
      <div class="title">${book.title}</div>
      <div class="author">${book.author}</div>
      <div class="genre">${book.genre}</div>
    `;
    list.appendChild(row);
  }
  static clearFields() {
    document.getElementById("title").value = "";
    document.getElementById("author").value = "";
    document.getElementById("genre").value = "";
  }
}
// Store class
class Store {
  static getBooks() {
    let books;
    if (localStorage.getItem("books") === null) {
      books = [];
    } else {
      books = JSON.parse(localStorage.getItem("books"));
    }
    return books;
  }
  static addBook(book) {
    const books = Store.getBooks();
    books.push(book);
    localStorage.setItem("books", JSON.stringify(books));
  }
}
// Event listener for form submission
document.getElementById("book-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const genre = document.getElementById("genre").value;
  const book = new Book(title, author, genre);
  UI.addBookToList(book);
  Store.addBook(book);
  UI.clearFields();
});
// Display books on page load
document.addEventListener("DOMContentLoaded", UI.displayBooks);
