document.addEventListener('DOMContentLoaded', function () {
    const API_KEY = 'jaoWPwhay0uNJbo6umb2XM9Us5m9jIjEbxbQmAJqepY';
    const API_URL = 'https://api.unsplash.com/search/photos';

    let currentPage = 1;
    let currentQuery = 'nature';
    let currentFilter = 'All Photos';

    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const gallery = document.getElementById('gallery');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const loadMoreContainer = document.getElementById('load-more-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const noResults = document.getElementById('no-results');
    const filterButtons = document.querySelectorAll('#filter-buttons button');

    const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
    const modalImage = document.getElementById('modal-image');
    const downloadBtn = document.getElementById('download-btn');

    const categoryQueries = {
        'All Photos': 'nature',
        'Nature': 'nature landscape',
        'People': 'portrait people',
        'Animals': 'animals wildlife',
        'Architecture': 'architecture building',
        'Food': 'food cuisine'
    };

    fetchImages(categoryQueries['All Photos']);

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') handleSearch();
    });

    loadMoreBtn.addEventListener('click', function () {
        currentPage++;
        const query = currentFilter === 'All Photos' ? currentQuery : categoryQueries[currentFilter];
        fetchImages(query, currentPage);
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            currentFilter = this.textContent.trim();
            currentPage = 1;
            gallery.innerHTML = '';

            const query = categoryQueries[currentFilter];
            fetchImages(query);
        });
    });

    function handleSearch() {
        const query = searchInput.value.trim();
        if (query) {
            currentQuery = query;
            currentPage = 1;
            currentFilter = 'All Photos';
            gallery.innerHTML = '';

            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.textContent.trim() === 'All Photos') {
                    btn.classList.add('active');
                }
            });

            fetchImages(query);
        }
    }

    async function fetchImages(query, page = 1) {
        loadingSpinner.classList.remove('d-none');
        loadMoreContainer.classList.add('d-none');
        noResults.classList.add('d-none');

        try {
            const response = await fetch(`${API_URL}?query=${query}&page=${page}&per_page=12&client_id=${API_KEY}`);
            const data = await response.json();

            loadingSpinner.classList.add('d-none');

            if (data.results.length === 0 && page === 1) {
                noResults.classList.remove('d-none');
                return;
            }

            if (page === 1) {
                gallery.innerHTML = '';
            }

            displayImages(data.results);

            if (data.results.length >= 12) {
                loadMoreContainer.classList.remove('d-none');
            }
        } catch (error) {
            console.error('Error fetching images:', error);
            loadingSpinner.classList.add('d-none');
            showError();
        }
    }

    function displayImages(images) {
        images.forEach(image => {
            const col = document.createElement('div');
            col.className = 'col-md-4 col-lg-3 gallery-item';

            const card = document.createElement('div');
            card.className = 'card h-100';

            const img = document.createElement('img');
            img.className = 'card-img-top';
            img.src = image.urls.thumb;
            img.alt = image.alt_description || 'Unsplash image';
            img.loading = 'lazy';

            img.addEventListener('click', () => openModal(image));

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            const title = document.createElement('h5');
            title.className = 'card-title';
            title.textContent = image.user.name || 'Unknown Photographer';

            const text = document.createElement('p');
            text.className = 'card-text';
            text.textContent = image.description || 'Beautiful photography';

            cardBody.appendChild(title);
            cardBody.appendChild(text);
            card.appendChild(img);
            card.appendChild(cardBody);
            col.appendChild(card);
            gallery.appendChild(col);
        });
    }

    function openModal(image) {
        modalImage.src = image.urls.regular;

        // Override default behavior to force browser download
        downloadBtn.onclick = () => downloadImage(image.urls.full, `photo-${image.id}.jpg`);

        imageModal.show();
    }

    window.copyToClipboard = function () {
        const imageUrl = modalImage.src;
        navigator.clipboard.writeText(imageUrl)
            .then(() => {
                alert('Copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy:', err);
            });
    };

    function downloadImage(url, filename) {
        fetch(url)
            .then(resp => resp.blob())
            .then(blob => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch(err => console.error('Download failed:', err));
    }

    function showError() {
        gallery.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <h4>Error loading images</h4>
                <p>Please try again later</p>
            </div>
        `;
    }
});
