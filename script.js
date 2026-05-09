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

  function loadLiterature() {
    const saved = localStorage.getItem('litshare_literature');
    if (saved) {
      literature = JSON.parse(saved);
    }
  }

  function saveLiterature() {
    localStorage.setItem('litshare_literature', JSON.stringify(literature));
  }

  const nav = document.querySelector('nav ul');
  const userStatusLi = document.createElement('li');
  userStatusLi.id = 'userStatusLi';
  userStatusLi.style.display = 'none';
  const userStatus = document.createElement('span');
  userStatus.id = 'userStatus';
  userStatusLi.appendChild(userStatus);
  
  const logoutLi = document.createElement('li');
  logoutLi.id = 'logoutLi';
  logoutLi.style.display = 'none';
  const logoutBtn = document.createElement('button');
  logoutBtn.id = 'logoutBtn';
  logoutBtn.textContent = 'Logout';
  logoutLi.appendChild(logoutBtn);
  
  nav.appendChild(userStatusLi);
  nav.appendChild(logoutLi);

  function updateUIBasedOnLogin() {
    if (loggedInUser) {
      userStatusLi.style.display = 'block';
      userStatus.textContent = loggedInUser;
      logoutLi.style.display = 'block';
      loginLink.style.display = 'none';
      loginSection.classList.add("hidden");
    } else {
      userStatusLi.style.display = 'none';
      logoutLi.style.display = 'none';
      loginLink.style.display = 'block';
    }
  }

  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    if (loggedInUser) {
      alert("You're already logged in!");
      return;
    }
    showSection(loginSection);
  });

  uploadLink.addEventListener("click", (e) => {
    e.preventDefault();
    if (!loggedInUser) {
      alert("You must log in first to upload literature!");
      showSection(loginSection);
      return;
    }
    showSection(uploadSection);
  });

  libraryLink.addEventListener("click", (e) => {
    e.preventDefault();
    showSection(librarySection);
    displayLibrary();
  });

  function showSection(section) {
    loginSection.classList.add("hidden");
    uploadSection.classList.add("hidden");
    librarySection.classList.add("hidden");
    section.classList.remove("hidden");
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      alert("Please fill in all fields!");
      return;
    }

    if (password.length < 3) {
      alert("Password must be at least 3 characters!");
      return;
    }

    loggedInUser = username;
    updateUIBasedOnLogin();
    alert("Welcome to LitShare, " + username + "!");
    loginForm.reset();
    showSection(librarySection);
    displayLibrary();
  });

  logoutBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to logout?")) {
      loggedInUser = null;
      updateUIBasedOnLogin();
      showSection(librarySection);
      displayLibrary();
      alert("You've been logged out successfully!");
    }
  });

  uploadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();

    if (!title || !content) {
      alert("Please fill in all fields!");
      return;
    }

    if (content.length < 10) {
      alert("Content must be at least 10 characters long!");
      return;
    }

    const newLiterature = {
      id: Date.now(),
      title,
      content,
      author: loggedInUser,
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };

    literature.unshift(newLiterature);
    saveLiterature();
    uploadForm.reset();
    displayLibrary();
    alert("Your literature has been shared successfully!");
  });

  function displayLibrary() {
    library.innerHTML = "";
    
    if (literature.length === 0) {
      library.innerHTML = `
        <div class="empty-state">
          <h3>No literature shared yet</h3>
          <p>${loggedInUser ? 'Click "Upload" to share your first piece!' : 'Login to start sharing literature!'}</p>
        </div>
      `;
      return;
    }

    literature.forEach((item) => {
      const div = document.createElement("div");
      div.classList.add("library-item");
      
      const preview = item.content.length > 200 
        ? item.content.substring(0, 200) + '...' 
        : item.content;
      
      div.innerHTML = `
        <h3>${item.title}</h3>
        <p><em>by ${item.author} - ${item.date || 'Just now'}</em></p>
        <p>${preview}</p>
        ${item.content.length > 200 ? '<button class="read-more-btn">Read More</button>' : ''}
      `;
      
      const readMoreBtn = div.querySelector('.read-more-btn');
      if (readMoreBtn) {
        let isExpanded = false;
        readMoreBtn.addEventListener('click', () => {
          const contentP = div.querySelector('p:last-of-type');
          if (isExpanded) {
            contentP.textContent = preview;
            readMoreBtn.textContent = 'Read More';
          } else {
            contentP.textContent = item.content;
            readMoreBtn.textContent = 'Show Less';
          }
          isExpanded = !isExpanded;
        });
        
        readMoreBtn.style.cssText = `
          background: none;
          border: none;
          color: #4a90e2;
          cursor: pointer;
          font-weight: 600;
          padding: 0.5rem 0;
          margin-top: 0.5rem;
        `;
        readMoreBtn.addEventListener('mouseenter', () => {
          readMoreBtn.style.textDecoration = 'underline';
        });
        readMoreBtn.addEventListener('mouseleave', () => {
          readMoreBtn.style.textDecoration = 'none';
        });
      }
      
      library.appendChild(div);
    });
  }

  loadLiterature();
  displayLibrary();
  updateUIBasedOnLogin();
  showSection(librarySection);
});
