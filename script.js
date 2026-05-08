document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("loginSection");
  const uploadSection = document.getElementById("uploadSection");
  const librarySection = document.getElementById("librarySection");
  const loginLink = document.getElementById("loginLink");
  const uploadLink = document.getElementById("uploadLink");
  const libraryLink = document.getElementById("libraryLink");
  const loginForm = document.getElementById("loginForm");
  const uploadForm = document.getElementById("uploadForm");
  const library = document.getElementById("library");

  let loggedInUser = null;
  let literature = [];

  // Navigation
  loginLink.addEventListener("click", () => {
    loginSection.classList.remove("hidden");
    uploadSection.classList.add("hidden");
    librarySection.classList.add("hidden");
  });

  uploadLink.addEventListener("click", () => {
    if (!loggedInUser) {
      alert("You must log in first!");
      return;
    }
    uploadSection.classList.remove("hidden");
    loginSection.classList.add("hidden");
    librarySection.classList.add("hidden");
  });

  libraryLink.addEventListener("click", () => {
    librarySection.classList.remove("hidden");
    loginSection.classList.add("hidden");
    uploadSection.classList.add("hidden");
  });

  // Login
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username && password) {
      loggedInUser = username;
      alert(`Welcome, ${username}!`);
      loginSection.classList.add("hidden");
      librarySection.classList.remove("hidden");
    }
  });

  // Upload
  uploadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    if (title && content) {
      literature.push({ title, content, author: loggedInUser });
      displayLibrary();
      uploadForm.reset();
      alert("Your literature has been uploaded!");
    }
  });

  // Display Library
  function displayLibrary() {
    library.innerHTML = "";
    literature.forEach((item) => {
      const div = document.createElement("div");
      div.classList.add("library-item");
      div.innerHTML = `
        <h3>${item.title}</h3>
        <p><em>by ${item.author}</em></p>
        <p>${item.content}</p>
      `;
      library.appendChild(div);
    });
  }
});
