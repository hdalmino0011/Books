var LiteratureDB = (function() {
  var data = [];
  var STORAGE_KEY = 'litshare_literature';

  function load() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      data = saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading data:', error);
      data = [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  load();

  return {
    create: function(title, content, author) {
      var newItem = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        title: title,
        content: content,
        author: author,
        date: new Date().toISOString()
      };
      data.unshift(newItem);
      save();
      return newItem;
    },

    getAll: function() {
      return data.slice().sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
      });
    },

    search: function(query) {
      if (!query.trim()) return this.getAll();
      var searchTerm = query.toLowerCase().trim();
      return data.filter(function(item) {
        return item.title.toLowerCase().indexOf(searchTerm) !== -1 ||
               item.content.toLowerCase().indexOf(searchTerm) !== -1 ||
               item.author.toLowerCase().indexOf(searchTerm) !== -1;
      }).sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
      });
    },

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

    count: function() {
      return data.length;
    }
  };
})();
