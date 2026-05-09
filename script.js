document.addEventListener("DOMContentLoaded", function() {
  // DOM Elements
  var librarySection = document.getElementById("librarySection");
  var uploadSection = document.getElementById("uploadSection");
  var loginSection = document.getElementById("loginSection");
  
  var libraryLink = document.getElementById("libraryLink");
  var uploadLink = document.getElementById("uploadLink");
  var loginLink = document.getElementById("loginLink");
  
  var library = document.getElementById("library");
  var uploadForm = document.getElementById("uploadForm");
  var loginForm = document.getElementById("loginForm");
  var searchInput = document.getElementById("searchInput");
  var userSection = document.getElementById("userSection");
  var userStatus = document.getElementById("userStatus");
  var userAvatar = document.getElementById("userAvatar");
  var logoutBtn = document.getElementById("logoutBtn");

  var loggedInUser = null;
  var currentSection = 'library';

  // Show notification
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

  // Navigation
  function navigateTo(section) {
    librarySection.classList.add('hidden');
    uploadSection.classList.add('hidden');
    loginSection.classList.add('hidden');
    
    libraryLink.classList.remove('active');
    uploadLink.classList.remove('active');
    loginLink.classList.remove('active');
    
    if (section === 'library') {
      librarySection.classList.remove('hidden');
      libraryLink.classList.add('active');
    } else if (section === 'upload') {
      uploadSection.classList.remove('hidden');
      uploadLink.classList.add('active');
    } else if (section === 'login') {
      loginSection.classList.remove('hidden');
      loginLink.classList.add('active');
    }
    
    currentSection = section;
  }

  libraryLink.addEventListener('click', function(e) {
    e.preventDefault();
    navigateTo('library');
    displayLibrary();
  });

  uploadLink.addEventListener('click', function(e) {
    e.preventDefault();
    if (!loggedInUser) {
      showNotification('Please login first to upload literature!', 'error');
      navigateTo('login');
      return;
    }
    navigateTo('upload');
  });

  loginLink.addEventListener('click', function(e) {
    e.preventDefault();
    if (loggedInUser) {
      showNotification('You are already logged in!', 'error');
      return;
    }
    navigateTo('login');
  });

  // Update UI based on auth state
  function updateAuthUI() {
    if (loggedInUser) {
      userSection.style.display = 'flex';
      userStatus.textContent = loggedInUser;
      userAvatar.textContent = loggedInUser.charAt(0).toUpperCase();
      loginLink.querySelector('span:last-child').textContent = 'Account';
    } else {
      userSection.style.display = 'none';
      loginLink.querySelector('span:last-child').textContent = 'Login';
    }
  }

  // Login handler
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var username = document.getElementById('username').value.trim();
    var password = document.getElementById('password').value.trim();

    if (!username || !password) {
      showNotification('Please fill in all fields!', 'error');
      return;
    }

    if (password.length < 3) {
      showNotification('Password must be at least 3 characters!', 'error');
      return;
    }

    loggedInUser = username;
    updateAuthUI();
    loginForm.reset();
    showNotification('Welcome back, ' + username + '!');
    navigateTo('library');
    displayLibrary();
  });

  // Logout handler
  logoutBtn.addEventListener('click', function() {
    loggedInUser = null;
    updateAuthUI();
    showNotification('Logged out successfully!');
    navigateTo('library');
    displayLibrary();
  });

  // Upload handler
  uploadForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var title = document.getElementById('title').value.trim();
    var content = document.getElementById('content').value.trim();

    if (!title || !content) {
      showNotification('Please fill in all fields!', 'error');
      return;
    }

    if (content.length < 10) {
      showNotification('Content must be at least 10 characters long!', 'error');
      return;
    }

    LiteratureDB.create(title, content, loggedInUser);
    uploadForm.reset();
    showNotification('Literature published successfully!');
    navigateTo('library');
    displayLibrary();
  });

  // Delete handler
  function deleteLiterature(id) {
    if (confirm('Are you sure you want to delete this literature?')) {
      LiteratureDB.delete(id);
      displayLibrary();
      showNotification('Literature deleted successfully!');
    }
  }

  // Display library
  function displayLibrary(query) {
    library.innerHTML = '';
    
    var items = query ? LiteratureDB.search(query) : LiteratureDB.getAll();
    
    if (items.length === 0) {
      library.innerHTML = '<div class="empty-state"><h3>No Literature Found</h3><p>' + 
        (query ? 'No results match your search.' : 'Be the first to share your literature!') + 
        '</p></div>';
      return;
    }

    items.forEach(function(item) {
      var div = document.createElement('div');
      div.classList.add('library-item');
      
      var preview = item.content.length > 200 
        ? item.content.substring(0, 200) + '...' 
        : item.content;
      
      var date = new Date(item.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      var deleteButton = '';
      if (loggedInUser === item.author) {
        deleteButton = '<div class="item-actions"><button class="action-btn delete-btn" data-id="' + item.id + '">&#128465;</button></div>';
      }

      var readMoreButton = '';
      if (item.content.length > 200) {
        readMoreButton = '<button class="read-more-btn">Read More</button>';
      }

      div.innerHTML = 
        '<div class="item-header">' +
          '<h3>' + item.title + '</h3>' +
          deleteButton +
        '</div>' +
        '<div class="item-meta">' +
          '<span class="author-avatar">' + item.author.charAt(0).toUpperCase() + '</span>' +
          '<span>' + item.author + '</span>' +
          '<span>-</span>' +
          '<span>' + date + '</span>' +
        '</div>' +
        '<div class="item-content">' + preview + '</div>' +
        readMoreButton;
      
      // Delete button handler
      var deleteBtn = div.querySelector('.delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
          deleteLiterature(item.id);
        });
      }
      
      // Read more button handler
      var readMoreBtn = div.querySelector('.read-more-btn');
      if (readMoreBtn) {
        var isExpanded = false;
        readMoreBtn.addEventListener('click', function() {
          var contentDiv = div.querySelector('.item-content');
          if (isExpanded) {
            contentDiv.textContent = preview;
            readMoreBtn.textContent = 'Read More';
          } else {
            contentDiv.textContent = item.content;
            readMoreBtn.textContent = 'Show Less';
          }
          isExpanded = !isExpanded;
        });
      }
      
      library.appendChild(div);
    });
  }

  // Search handler
  searchInput.addEventListener('input', function(e) {
    displayLibrary(e.target.value);
  });

  // Initial load
  updateAuthUI();
  displayLibrary();
});
