// Literature Database Module
const LiteratureDB = (function() {
  // Private variables
  var data = [];
  var STORAGE_KEY = 'litshare_literature';

  // Load data from localStorage
  function load() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      data = saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading data:', error);
      data = [];
    }
  }

  // Save data to localStorage
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Initialize
  load();

  // Public methods
  return {
    // Create new literature
    create: function(title, content, author) {
      var newItem = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        title: title,
        content: content,
        author: author,
        date: new Date().toISOString(),
        updatedAt: null
      };
      data.unshift(newItem);
      save();
      return newItem;
    },

    // Get all literature
    getAll: function() {
      return data.slice().sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
      });
    },

    // Search literature
    search: function(query) {
      if (!query.trim()) return this.getAll();
      
      var searchTerm = query.toLowerCase().trim();
      return data.filter(function(item) {
        return item.title.toLowerCase().includes(searchTerm) ||
               item.content.toLowerCase().includes(searchTerm) ||
               item.author.toLowerCase().includes(searchTerm);
      }).sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
      });
    },

    // Delete literature
    delete: function(id) {
      var initialLength = data.length;
      data = data.filter(function(item) {
        return item.id !== id;
      });
      
      if (data.length < initialLength) {
        save();
        return true;
      }
      return false;
    },

    // Get count
    count: function() {
      return data.length;
    }
  };
})();
