document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const sections = {
    library: document.getElementById("librarySection"),
    upload: document.getElementById("uploadSection"),
    login: document.getElementById("loginSection")
  };

  const navItems = {
    library: document.getElementById("libraryLink"),
    upload: document.getElementById("uploadLink"),
    login: document.getElementById("loginLink")
  };

  const library = document.getElementById("library");
  const uploadForm = document.getElementById("uploadForm");
  const loginForm = document.getElementById("loginForm");
  const searchInput = document.getElementById("searchInput");
  const userSection = document.getElementById("userSection");
  const userStatus = document.getElementById("userStatus");
  const userAvatar = document.getElementById("userAvatar");
  const logoutBtn = document.getElementById("logoutBtn");

  let loggedInUser = null;
  let currentSection = 'library';

  // Show notification
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Navigation
  function navigateTo(section) {
    Object.values(sections).forEach(s => s.classList.add('hidden'));
    Object.values(navItems).forEach(n => n.classList.remove('active'));
    
    sections[section].classList.remove('hidden');
    navItems[section].classList.add('active');
    currentSection = section;
  }

  navItems.library.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('library');
    displayLibrary();
  });

  navItems.upload.addEventListener('click', (e) => {
    e.preventDefault();
    if (!loggedInUser) {
      showNotification('Please login first to upload literature!', 'error');
      navigateTo('login');
      return;
    }
    navigateTo('upload');
  });

  navItems.login.addEventListener('click', (e) => {
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
      navItems.login.querySelector('span').textContent = 'Account';
    } else {
      userSection.style.display = 'none';
      navItems.login.querySelector('span').textContent = 'Login';
    }
  }

  // Login handler
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

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
    showNotification(`Welcome back, ${username}!`);
    navigateTo('library');
    displayLibrary();
  });

  // Logout handler
  logoutBtn.addEventListener('click', () => {
    loggedInUser = null;
    updateAuthUI();
    showNotification('Logged out successfully!');
    navigateTo('library');
    displayLibrary();
  });

  // Upload handler
  uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();

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
  function displayLibrary(query = '') {
    library.innerHTML = '';
    
    const items = query ? LiteratureDB.search(query) : LiteratureDB.getAll();
    
    if (items.length === 0) {
      library.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-books"></i>
          <h3>No Literature Found</h3>
          <p>${query ? 'No results match your search.' : 'Be the first to share your literature!'}</p>
        </div>
      `;
      return;
    }

    items.forEach((item) => {
      const div = document.createElement('div');
      div.classList.add('library-item');
      
      const preview = item.content.length > 200 
        ? item.content.substring(0, 200) + '...' 
        : item.content;
      
      const date = new Date(item.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      div.innerHTML = `
        <div class="item-header">
          <h3>${item.title}</h3>
          ${loggedInUser === item.author ? `
            <div class="item-actions">
              <button class="action-btn delete-btn" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          ` : ''}
        </div>
        <div class="item-meta">
          <span class="author-avatar">${item.author.charAt(0).toUpperCase()}</span>
          <span>${item.author}</span>
          <span>-</span>
          <span>${date}</span>
        </div>
        <div class="item-content">${preview}</div>
        ${item.content.length > 200 ? '<button class="read-more-btn">Read More</button>' : ''}
      `;
      
      const deleteBtn = div.querySelector('.delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => deleteLiterature(item.id));
      }
      
      const readMoreBtn = div.querySelector('.read-more-btn');
      if (readMoreBtn) {
        let isExpanded = false;
        readMoreBtn.addEventListener('click', () => {
          const contentDiv = div.querySelector('.item-content');
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
  searchInput.addEventListener('input', (e) => {
    displayLibrary(e.target.value);
  });

  // Initial load
  updateAuthUI();
  displayLibrary();
});
