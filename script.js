document.addEventListener("DOMContentLoaded", function() {
  var homeSection = document.getElementById("homeSection");
  var librarySection = document.getElementById("librarySection");
  var uploadSection = document.getElementById("uploadSection");
  var aboutSection = document.getElementById("aboutSection");
  var loginSection = document.getElementById("loginSection");
  
  var homeLink = document.getElementById("homeLink");
  var libraryLink = document.getElementById("libraryLink");
  var uploadLink = document.getElementById("uploadLink");
  var aboutLink = document.getElementById("aboutLink");
  var loginLink = document.getElementById("loginLink");
  
  var library = document.getElementById("library");
  var uploadForm = document.getElementById("uploadForm");
  var loginForm = document.getElementById("loginForm");
  var searchInput = document.getElementById("searchInput");
  var userArea = document.getElementById("userArea");
  var userDisplay = document.getElementById("userDisplay");
  var logoutBtn = document.getElementById("logoutBtn");
  var getStartedBtn = document.getElementById("getStartedBtn");
  var exploreBtn = document.getElementById("exploreBtn");

  var loggedInUser = null;

  function showNotification(message, type) {
    type = type || 'success';
    var notification = document.createElement('div');
    notification.className = 'notification ' + type;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(function() {
      notification.remove();
    }, 3000);
  }

  function hideAllSections() {
    homeSection.classList.add("hidden");
    librarySection.classList.add("hidden");
    uploadSection.classList.add("hidden");
    aboutSection.classList.add("hidden");
    loginSection.classList.add("hidden");
  }

  function removeActiveClass() {
    homeLink.classList.remove("active");
    libraryLink.classList.remove("active");
    uploadLink.classList.remove("active");
    aboutLink.classList.remove("active");
    loginLink.classList.remove("active");
  }

  function navigateTo(section, link) {
    hideAllSections();
    removeActiveClass();
    section.classList.remove("hidden");
    link.classList.add("active");
  }

  function updateAuthUI() {
    if (loggedInUser) {
      userArea.style.display = "flex";
      userDisplay.textContent = "Welcome, " + loggedInUser;
      loginLink.style.display = "none";
    } else {
      userArea.style.display = "none";
      loginLink.style.display = "block";
    }
  }

  // Navigation
  homeLink.addEventListener("click", function(e) {
    e.preventDefault();
    navigateTo(homeSection, homeLink);
  });

  libraryLink.addEventListener("click", function(e) {
    e.preventDefault();
    navigateTo(librarySection, libraryLink);
    displayLibrary();
  });

  uploadLink.addEventListener("click", function(e) {
    e.preventDefault();
    if (!loggedInUser) {
      showNotification("Please login first to upload literature!", "error");
      navigateTo(loginSection, loginLink);
      return;
    }
    navigateTo(uploadSection, uploadLink);
  });

  aboutLink.addEventListener("click", function(e) {
    e.preventDefault();
    navigateTo(aboutSection, aboutLink);
  });

  loginLink.addEventListener("click", function(e) {
    e.preventDefault();
    if (loggedInUser) {
      showNotification("You are already logged in!", "error");
      return;
    }
    navigateTo(loginSection, loginLink);
  });

  // Hero buttons
  getStartedBtn.addEventListener("click", function() {
    if (!loggedInUser) {
      navigateTo(loginSection, loginLink);
    } else {
      navigateTo(uploadSection, uploadLink);
    }
  });

  exploreBtn.addEventListener("click", function() {
    navigateTo(librarySection, libraryLink);
    displayLibrary();
  });

  // Login
  loginForm.addEventListener("submit", function(e) {
    e.preventDefault();
    var username = document.getElementById("username").value.trim();
    var password = document.getElementById("password").value.trim();

    if (!username || !password) {
      showNotification("Please fill in all fields!", "error");
      return;
    }

    if (password.length < 3) {
      showNotification("Password must be at least 3 characters!", "error");
      return;
    }

    loggedInUser = username;
    updateAuthUI();
    loginForm.reset();
    showNotification("Welcome, " + username + "!");
    navigateTo(homeSection, homeLink);
  });

  // Logout
  logoutBtn.addEventListener("click", function() {
    loggedInUser = null;
    updateAuthUI();
    showNotification("Logged out successfully!");
    navigateTo(homeSection, homeLink);
  });

  // Upload
  uploadForm.addEventListener("submit", function(e) {
    e.preventDefault();
    var title = document.getElementById("title").value.trim();
    var content = document.getElementById("content").value.trim();

    if (!title || !content) {
      showNotification("Please fill in all fields!", "error");
      return;
    }

    if (content.length < 10) {
      showNotification("Content must be at least 10 characters long!", "error");
      return;
    }

    LiteratureDB.create(title, content, loggedInUser);
    uploadForm.reset();
    showNotification("Literature published successfully!");
    navigateTo(librarySection, libraryLink);
    displayLibrary();
  });

  // Delete
  function deleteLiterature(id) {
    if (confirm("Are you sure you want to delete this literature?")) {
      LiteratureDB.delete(id);
      displayLibrary();
      showNotification("Literature deleted successfully!");
    }
  }

  // Display library
  function displayLibrary(query) {
    library.innerHTML = "";
    var items = query ? LiteratureDB.search(query) : LiteratureDB.getAll();

    if (items.length === 0) {
      library.innerHTML = '<div class="empty-state"><h3>No Literature Found</h3><p>' + 
        (query ? "No results match your search." : "Be the first to share your literature!") + 
        '</p></div>';
      return;
    }

    items.forEach(function(item) {
      var div = document.createElement("div");
      div.classList.add("library-item");
      
      var preview = item.content.length > 200 ? item.content.substring(0, 200) + "..." : item.content;
      var date = new Date(item.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });

      var deleteButton = "";
      if (loggedInUser === item.author) {
        deleteButton = '<div class="item-actions"><button data-id="' + item.id + '">Delete</button></div>';
      }

      var readMoreButton = "";
      if (item.content.length > 200) {
        readMoreButton = '<button class="read-more-btn">Read More</button>';
      }

      div.innerHTML = 
        '<div class="item-header">' +
          '<h3>' + item.title + '</h3>' +
          deleteButton +
        '</div>' +
        '<div class="item-meta">By ' + item.author + ' on ' + date + '</div>' +
        '<div class="item-content">' + preview + '</div>' +
        readMoreButton;

      var deleteBtn = div.querySelector(".item-actions button");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", function() {
          deleteLiterature(item.id);
        });
      }

      var readMoreBtn = div.querySelector(".read-more-btn");
      if (readMoreBtn) {
        var isExpanded = false;
        readMoreBtn.addEventListener("click", function() {
          var contentDiv = div.querySelector(".item-content");
          if (isExpanded) {
            contentDiv.textContent = preview;
            readMoreBtn.textContent = "Read More";
          } else {
            contentDiv.textContent = item.content;
            readMoreBtn.textContent = "Show Less";
          }
          isExpanded = !isExpanded;
        });
      }

      library.appendChild(div);
    });
  }

  // Search
  searchInput.addEventListener("input", function(e) {
    displayLibrary(e.target.value);
  });

  // Init
  updateAuthUI();
});
