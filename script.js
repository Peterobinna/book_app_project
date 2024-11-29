// Replace with your actual Google Books API key
const API_KEY = 'AIzaSyDB-Au4nhqk8vuhcUq3MsTmEhVOY4s9gvE';
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchType = document.getElementById('searchType');
const sortBy = document.getElementById('sortBy');
const booksContainer = document.getElementById('booksContainer');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const currentPageSpan = document.getElementById('currentPage');
const bookDetailsModal = document.getElementById('bookDetailsModal');
const bookDetailsContent = document.getElementById('bookDetailsContent');
const closeModalBtn = document.querySelector('.close-button');

// State variables
let currentPage = 1;
let totalResults = 0;
let currentQuery = '';

// Event Listeners
searchButton.addEventListener('click', searchBooks);
sortBy.addEventListener('change', searchBooks);
prevPageBtn.addEventListener('click', () => changePage(-1));
nextPageBtn.addEventListener('click', () => changePage(1));
closeModalBtn.addEventListener('click', closeBookDetailsModal);

// Search Books Function
async function searchBooks() {
    const query = searchInput.value.trim();
    const type = searchType.value;
    const sort = sortBy.value;

    if (!query) return;

    try {
        const response = await fetch(`${BASE_URL}?q=${getFormattedQuery(query, type)}&orderBy=${sort}&maxResults=12&startIndex=${(currentPage - 1) * 12}&key=${API_KEY}`);
        const data = await response.json();

        displayBooks(data.items || []);
        updatePagination(data.totalItems);
        currentQuery = query;
    } catch (error) {
        console.error('Error fetching books:', error);
        booksContainer.innerHTML = '<p>Error fetching books. Please try again.</p>';
    }
}

// Format Query Based on Search Type
function getFormattedQuery(query, type) {
    switch(type) {
        case 'title': return `intitle:${query}`;
        case 'author': return `inauthor:${query}`;
        case 'genre': return `subject:${query}`;
        default: return query;
    }
}

// Display Books
function displayBooks(books) {
    booksContainer.innerHTML = books.map(book => {
        const volumeInfo = book.volumeInfo || {};
        const thumbnail = volumeInfo.imageLinks?.thumbnail || 'placeholder.svg';
        const author = volumeInfo.authors ? volumeInfo.authors[0] : 'Unknown Author';

        return `
            <div class="book-card" data-book-id="${book.id}">
                <img src="${thumbnail}" alt="${volumeInfo.title}">
                <h3>${volumeInfo.title}</h3>
                <p>${author}</p>
                <button onclick="showBookDetails('${book.id}')">View Details</button>
            </div>
        `;
    }).join('');
}

// Show Book Details
async function showBookDetails(bookId) {
    try {
        const response = await fetch(`${BASE_URL}/${bookId}`);
        const book = await response.json();
        const volumeInfo = book.volumeInfo;

        bookDetailsContent.innerHTML = `
            <h2>${volumeInfo.title}</h2>
            <p><strong>Author(s):</strong> ${volumeInfo.authors?.join(', ') || 'Unknown'}</p>
            <p><strong>Published:</strong> ${volumeInfo.publishedDate || 'N/A'}</p>
            <p><strong>Description:</strong> ${volumeInfo.description || 'No description available'}</p>
            <p><strong>Pages:</strong> ${volumeInfo.pageCount || 'N/A'}</p>
            ${volumeInfo.previewLink ? `<a href="${volumeInfo.previewLink}" target="_blank">Preview Book</a>` : ''}
        `;

        bookDetailsModal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching book details:', error);
    }
}

// Close Book Details Modal
function closeBookDetailsModal() {
    bookDetailsModal.style.display = 'none';
}

// Pagination Functions
function changePage(direction) {
    currentPage += direction;
    searchBooks();
}

function updatePagination(totalItems) {
    const maxResults = 12;
    const totalPages = Math.ceil(totalItems / maxResults);

    currentPageSpan.textContent = `Page ${currentPage}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage >= totalPages;
}

// Close modal if clicked outside
window.addEventListener('click', (event) => {
    if (event.target === bookDetailsModal) {
        closeBookDetailsModal();
    }
});

// Existing code remains the same, add these new functions and classes

class FavoriteBooks {
  constructor() {
      this.favorites = JSON.parse(localStorage.getItem('favoriteBooks')) || [];
  }

  addToFavorites(book) {
      const bookData = {
          id: book.id,
          title: book.volumeInfo.title,
          authors: book.volumeInfo.authors,
          thumbnail: book.volumeInfo.imageLinks?.thumbnail || 'placeholder.svg',
          addedDate: new Date().toISOString()
      };

      // Check if book is already in favorites
      if (!this.favorites.some(f => f.id === bookData.id)) {
          this.favorites.push(bookData);
          this.saveFavorites();
          this.updateFavoritesUI();
          this.showFavoriteNotification(bookData.title);
      }
  }

  removeFromFavorites(bookId) {
      this.favorites = this.favorites.filter(book => book.id !== bookId);
      this.saveFavorites();
      this.updateFavoritesUI();
  }

  saveFavorites() {
      localStorage.setItem('favoriteBooks', JSON.stringify(this.favorites));
  }

  updateFavoritesUI() {
      const favoritesContainer = document.getElementById('favoritesList');
      if (favoritesContainer) {
          if (this.favorites.length === 0) {
              favoritesContainer.innerHTML = '<p>No favorites yet. Start adding books!</p>';
          } else {
              favoritesContainer.innerHTML = this.favorites.map(book => `
                  <div class="favorite-book-card">
                      <img src="${book.thumbnail}" alt="${book.title}">
                      <div class="favorite-book-details">
                          <h3>${book.title}</h3>
                          <p>${book.authors ? book.authors.join(', ') : 'Unknown Author'}</p>
                          <p>Added: ${new Date(book.addedDate).toLocaleDateString()}</p>
                          <button onclick="favoritesManager.removeFromFavorites('${book.id}')">Remove</button>
                      </div>
                  </div>
              `).join('');
          }
      }
      
      // Update favorites count
      const favoritesCountElement = document.getElementById('favoritesCount');
      if (favoritesCountElement) {
          favoritesCountElement.textContent = this.favorites.length;
      }
  }

  showFavoriteNotification(title) {
      const notification = document.createElement('div');
      notification.className = 'favorite-notification';
      notification.textContent = `Added "${title}" to favorites!`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
          notification.classList.add('hide');
          setTimeout(() => {
              document.body.removeChild(notification);
          }, 500);
      }, 3000);
  }

  isFavorite(bookId) {
      return this.favorites.some(book => book.id === bookId);
  }
}

// Initialize favorites manager
const favoritesManager = new FavoriteBooks();

// Modify existing showBookDetails function to include favorite button
async function showBookDetails(bookId) {
  try {
      const response = await fetch(`${BASE_URL}/${bookId}`);
      const book = await response.json();
      const volumeInfo = book.volumeInfo;

      const isFavorite = favoritesManager.isFavorite(bookId);

      bookDetailsContent.innerHTML = `
          <h2>${volumeInfo.title}</h2>
          <p><strong>Author(s):</strong> ${volumeInfo.authors?.join(', ') || 'Unknown'}</p>
          <p><strong>Published:</strong> ${volumeInfo.publishedDate || 'N/A'}</p>
          <p><strong>Description:</strong> ${volumeInfo.description || 'No description available'}</p>
          <p><strong>Pages:</strong> ${volumeInfo.pageCount || 'N/A'}</p>
          ${volumeInfo.previewLink ? `<a href="${volumeInfo.previewLink}" target="_blank">Preview Book</a>` : ''}
          <button onclick="favoritesManager.addToFavorites(${JSON.stringify(book).replace(/"/g, '&quot;')})" 
                  class="favorite-btn ${isFavorite ? 'favorited' : ''}">
              ${isFavorite ? '★ Favorited' : '☆ Add to Favorites'}
          </button>
      `;

      bookDetailsModal.style.display = 'block';
  } catch (error) {
      console.error('Error fetching book details:', error);
  }
}

// Modify displayBooks to add favorite button
function displayBooks(books) {
  booksContainer.innerHTML = books.map(book => {
      const volumeInfo = book.volumeInfo || {};
      const thumbnail = volumeInfo.imageLinks?.thumbnail || 'placeholder.svg';
      const author = volumeInfo.authors ? volumeInfo.authors[0] : 'Unknown Author';

      return `
          <div class="book-card" data-book-id="${book.id}">
              <img src="${thumbnail}" alt="${volumeInfo.title}">
              <h3>${volumeInfo.title}</h3>
              <p>${author}</p>
              <div class="book-card-actions">
                  <button onclick="showBookDetails('${book.id}')">View Details</button>
                  <button onclick="favoritesManager.addToFavorites(${JSON.stringify(book).replace(/"/g, '&quot;')})" 
                          class="favorite-btn ${favoritesManager.isFavorite(book.id) ? 'favorited' : ''}">
                      ${favoritesManager.isFavorite(book.id) ? '★' : '☆'}
                  </button>
              </div>
          </div>
      `;
  }).join('');
}

function renderFavoriteBooks() {
  const favoritesList = document.getElementById('favoritesList');
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const favoritesCount = document.getElementById('favoritesCount');

  // Clear existing content
  favoritesList.innerHTML = '';

  if (favorites.length === 0) {
      favoritesList.innerHTML = `
          <div class="empty-favorites">
              <p>Your favorite books collection is empty!</p>
              <button class="explore-btn" onclick="scrollToSearch()">
                  <i class="fas fa-book-open"></i> Explore Books
              </button>
          </div>
      `;
      favoritesCount.textContent = '0';
      return;
  }

  favoritesCount.textContent = favorites.length;

  favorites.forEach((book, index) => {
      const bookCard = document.createElement('div');
      bookCard.className = 'favorite-book-card';
      bookCard.innerHTML = `
          <img src="${book.coverImage || 'placeholder-book-cover.jpg'}" alt="${book.title}">
          <div class="favorite-book-details">
              <h3>${book.title}</h3>
              <p>${book.author}</p>
          </div>
          <div class="favorite-book-actions">
              <button class="remove-favorite-btn" onclick="removeFavorite(${index})">
                  <i class="fas fa-trash"></i> Remove
              </button>
          </div>
      `;
      favoritesList.appendChild(bookCard);
  });
}

function removeFavorite(index) {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  favorites.splice(index, 1);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  renderFavoriteBooks();
}

function scrollToSearch() {
  document.getElementById('searchInput').scrollIntoView({ behavior: 'smooth' });
  document.getElementById('searchInput').focus();
}

// Call this function when the page loads and after adding/removing favorites
renderFavoriteBooks();