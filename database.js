// Literature Database Module
const LiteratureDB = (() => {
  // Private variables
  let data = [];
  const STORAGE_KEY = 'litshare_literature';

  // Load data from localStorage
  const load = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      data = saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading data:', error);
      data = [];
    }
  };

  // Save data to localStorage
  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Initialize
  load();

  // Public methods
  return {
    // Create new literature
    create: (title, content, author) => {
      const newItem = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        title,
        content,
        author,
        date: new Date().toISOString(),
        updatedAt: null
      };
      data.unshift(newItem);
      save();
      return newItem;
    },

    // Get all literature
    getAll: () => {
      return [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    // Get single item by ID
    getById: (id) => {
      return data.find(item => item.id === id) || null;
    },

    // Search literature
    search: (query) => {
      if (!query.trim()) return this.getAll();
      
      const searchTerm = query.toLowerCase().trim();
      return data.filter(item =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.content.toLowerCase().includes(searchTerm) ||
        item.author.toLowerCase().includes(searchTerm)
      ).sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    // Update literature
    update: (id, newTitle, newContent) => {
      const index = data.findIndex(item => item.id === id);
      if (index !== -1) {
        data[index].title = newTitle;
        data[index].content = newContent;
        data[index].updatedAt = new Date().toISOString();
        save();
        return true;
      }
      return false;
    },

    // Delete literature
    delete: (id) => {
      const initialLength = data.length;
      data = data.filter(item => item.id !== id);
      
      if (data.length < initialLength) {
        save();
        return true;
      }
      return false;
    },

    // Get count
    count: () => data.length,

    // Get literature by author
    getByAuthor: (author) => {
      return data.filter(item => item.author === author)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    // Clear all data (for debugging)
    clearAll: () => {
      data = [];
      save();
    },

    // Get statistics
    getStats: () => {
      const authors = [...new Set(data.map(item => item.author))];
      return {
        total: data.length,
        authors: authors.length,
        recentCount: data.filter(item => {
          const daysDiff = (new Date() - new Date(item.date)) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7;
        }).length
      };
    }
  };
})();
