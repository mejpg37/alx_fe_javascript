// Array of quote objects - Task 0
let quotes = loadQuotesFromStorage();
let currentFilter = localStorage.getItem('currentFilter') || 'all';
let lastSyncTime = localStorage.getItem('lastSyncTime') || null;
let conflictResolutionEnabled = true;

// Task 1: Load quotes from local storage
function loadQuotesFromStorage() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        return JSON.parse(storedQuotes);
    } else {
        // Default quotes
        return [
            { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
            { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" },
            { text: "Life is what happens to you while you're busy making other plans.", category: "Life" },
            { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" }
        ];
    }
}

// Task 1: Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    localStorage.setItem('currentFilter', currentFilter);
    
    // Store last viewed quote in session storage
    if (document.getElementById('quoteDisplay').innerHTML) {
        sessionStorage.setItem('lastViewed', document.getElementById('quoteDisplay').innerHTML);
    }
    
    // Update categories dropdown - Task 2
    populateCategories();
}

// Task 2: Populate categories dropdown
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const currentCategories = Array.from(categoryFilter.options).map(opt => opt.value);
    
    // Get unique categories from quotes
    const categories = ['all'];
    quotes.forEach(quote => {
        if (!categories.includes(quote.category)) {
            categories.push(quote.category);
        }
    });
    
    // Only update if categories changed
    if (JSON.stringify(categories) !== JSON.stringify(currentCategories)) {
        categoryFilter.innerHTML = '';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category === 'all' ? 'All Categories' : category;
            categoryFilter.appendChild(option);
        });
        
        // Restore last filter
        categoryFilter.value = currentFilter;
    }
}

// Task 2: Filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    currentFilter = selectedCategory;
    localStorage.setItem('currentFilter', currentFilter);
    
    const quoteDisplay = document.getElementById('quoteDisplay');
    
    if (selectedCategory === 'all') {
        showRandomQuote();
    } else {
        const filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
        if (filteredQuotes.length > 0) {
            const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
            const randomQuote = filteredQuotes[randomIndex];
            
            quoteDisplay.innerHTML = `
                <p>"${randomQuote.text}"</p>
                <p class="category">- ${randomQuote.category}</p>
                <div class="quote-count">Showing from ${filteredQuotes.length} quotes in this category</div>
            `;
        } else {
            quoteDisplay.innerHTML = `<p>No quotes found in category: "${selectedCategory}"</p>`;
        }
    }
}

// Task 0: Display a random quote
function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    
    if (quotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available. Add some quotes first!</p>';
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    
    quoteDisplay.innerHTML = `
        <p>"${randomQuote.text}"</p>
        <p class="category">- ${randomQuote.category}</p>
        <div class="quote-count">Total quotes: ${quotes.length}</div>
    `;
    
    saveQuotes();
}

// Task 0: Add a new quote
function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
    
    if (quoteText && quoteCategory) {
        const newQuote = {
            text: quoteText,
            category: quoteCategory
        };
        
        quotes.push(newQuote);
        saveQuotes();
        
        // Clear input fields
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        
        showNotification('Quote added successfully!', 'success');
        showSpecificQuote(newQuote);
        
        // Task 3: Simulate posting to server after adding quote
        setTimeout(() => {
            postQuoteToServer(newQuote);
        }, 1000);
    } else {
        showNotification('Please enter both quote text and category.', 'error');
    }
}

// Helper function to display a specific quote
function showSpecificQuote(quote) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = `
        <p>"${quote.text}"</p>
        <p class="category">- ${quote.category}</p>
    `;
    saveQuotes();
}

// Task 0: Create add quote form (already implemented in HTML)
function createAddQuoteForm() {
    console.log('Add quote form is available');
}

// Task 1: Export quotes to JSON file
function exportToJson() {
    if (quotes.length === 0) {
        showNotification('No quotes to export!', 'warning');
        return;
    }
    
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'quotes.json';
    link.click();
    
    URL.revokeObjectURL(link.href);
    showNotification('Quotes exported successfully!', 'success');
}

// Task 1: Import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            if (Array.isArray(importedQuotes)) {
                const originalCount = quotes.length;
                quotes.push(...importedQuotes);
                saveQuotes();
                showNotification(`Quotes imported successfully! Added ${quotes.length - originalCount} new quotes.`, 'success');
                showRandomQuote();
                
                // Task 3: Sync after import
                setTimeout(syncQuotes, 1500);
            } else {
                showNotification('Invalid JSON format. Expected an array of quotes.', 'error');
            }
        } catch (error) {
            showNotification('Error parsing JSON file: ' + error.message, 'error');
        }
    };
    fileReader.readAsText(file);
    event.target.value = '';
}

// ========== TASK 3 SPECIFIC FUNCTIONS ==========

// Task 3: Fetch quotes from server using JSONPlaceholder API
async function fetchQuotesFromServer() {
    try {
        showNotification('Fetching quotes from server...', 'info');
        
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const posts = await response.json();
        
        // Convert posts to our quote format
        const serverQuotes = posts.slice(0, 5).map((post, index) => ({
            text: post.title,
            category: `Server-${index + 1}`
        }));
        
        // Add some predefined server quotes for variety
        serverQuotes.push(
            { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
            { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" },
            { text: "Life is what happens to you while you're busy making other plans.", category: "Life" }
        );
        
        showNotification('Successfully fetched quotes from server!', 'success');
        return serverQuotes;
        
    } catch (error) {
        showNotification('Error fetching from server: ' + error.message, 'error');
        // Return fallback quotes if server is unavailable
        return [
            { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
            { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" },
            { text: "Life is what happens to you while you're busy making other plans.", category: "Life" }
        ];
    }
}

// Task 3: Post quote to server using JSONPlaceholder API
async function postQuoteToServer(quote) {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: quote.text,
                body: `Category: ${quote.category}`,
                userId: 1
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Quote posted to server:', result);
        showNotification('Quote synced with server!', 'success');
        
    } catch (error) {
        console.log('Error posting to server (expected for mock API):', error.message);
        showNotification('Note: Server is mock - data not actually saved', 'info');
    }
}

// Task 3: Sync quotes function
async function syncQuotes() {
    showNotification('Starting sync with server...', 'info');
    
    try {
        // Fetch data from server using JSONPlaceholder API
        const serverQuotesData = await fetchQuotesFromServer();
        
        // Find and handle conflicts
        const conflicts = findConflicts(quotes, serverQuotesData);
        
        if (conflicts.length > 0) {
            showNotification(`Found ${conflicts.length} conflicts during sync`, 'warning');
            resolveConflicts(conflicts);
        }
        
        // Merge server quotes with local quotes
        const mergedQuotes = mergeQuotes(quotes, serverQuotesData);
        const newQuotesCount = mergedQuotes.length - quotes.length;
        
        if (newQuotesCount > 0) {
            quotes = mergedQuotes;
            saveQuotes();
            showNotification(`Sync completed! Added ${newQuotesCount} new quotes from server.`, 'success');
        } else {
            showNotification('Sync completed! Data is up to date.', 'success');
        }
        
        showRandomQuote();
        lastSyncTime = new Date().toISOString();
        localStorage.setItem('lastSyncTime', lastSyncTime);
        updateSyncStatus();
        
    } catch (error) {
        showNotification('Error during sync: ' + error.message, 'error');
    }
}

// Task 3: Find conflicts between local and server quotes
function findConflicts(localQuotes, serverQuotes) {
    const conflicts = [];
    
    serverQuotes.forEach(serverQuote => {
        const localMatch = localQuotes.find(localQuote => 
            localQuote.text === serverQuote.text && localQuote.category !== serverQuote.category
        );
        
        if (localMatch) {
            conflicts.push({
                local: localMatch,
                server: serverQuote,
                type: 'category_mismatch'
            });
        }
    });
    
    return conflicts;
}

// Task 3: Resolve conflicts
function resolveConflicts(conflicts) {
    if (!conflictResolutionEnabled) {
        showNotification('Conflict resolution is disabled. Conflicts not resolved.', 'warning');
        return;
    }
    
    let resolvedCount = 0;
    conflicts.forEach(conflict => {
        if (conflict.type === 'category_mismatch') {
            // Server takes precedence in automatic resolution
            const index = quotes.findIndex(q => q.text === conflict.local.text);
            if (index !== -1) {
                quotes[index] = { ...conflict.server };
                resolvedCount++;
            }
        }
    });
    
    if (resolvedCount > 0) {
        saveQuotes();
        showNotification(`Automatically resolved ${resolvedCount} conflicts.`, 'success');
    }
}

// Task 3: Merge quotes from local and server
function mergeQuotes(localQuotes, serverQuotes) {
    const merged = [...localQuotes];
    
    serverQuotes.forEach(serverQuote => {
        const exists = merged.some(localQuote => 
            localQuote.text === serverQuote.text && localQuote.category === serverQuote.category
        );
        
        if (!exists) {
            // Check if same text exists with different category
            const conflictIndex = merged.findIndex(localQuote => 
                localQuote.text === serverQuote.text
            );
            
            if (conflictIndex === -1) {
                merged.push(serverQuote);
            }
        }
    });
    
    return merged;
}

// Task 3: Manual conflict resolution
function manualConflictResolution() {
    showNotification('Checking for conflicts...', 'info');
    
    setTimeout(async () => {
        try {
            const serverQuotesData = await fetchQuotesFromServer();
            const conflicts = findConflicts(quotes, serverQuotesData);
            
            if (conflicts.length === 0) {
                showNotification('No conflicts found!', 'success');
                return;
            }
            
            let resolutionText = `Found ${conflicts.length} conflict(s):\n\n`;
            conflicts.forEach((conflict, index) => {
                resolutionText += `${index + 1}. "${conflict.local.text}"\n`;
                resolutionText += `   Local: ${conflict.local.category}\n`;
                resolutionText += `   Server: ${conflict.server.category}\n\n`;
            });
            
            resolutionText += "Server version will be used for resolution.";
            
            if (confirm(resolutionText + "\n\nProceed with automatic resolution?")) {
                resolveConflicts(conflicts);
                showNotification('Manual conflict resolution completed!', 'success');
            }
        } catch (error) {
            showNotification('Error during conflict resolution: ' + error.message, 'error');
        }
    }, 1000);
}

// Task 3: Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Force reflow
    notification.offsetHeight;
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Task 3: Update sync status display
function updateSyncStatus() {
    const syncStatus = document.getElementById('syncStatus');
    if (lastSyncTime) {
        const lastSync = new Date(lastSyncTime).toLocaleTimeString();
        syncStatus.textContent = `Last sync: ${lastSync}`;
        syncStatus.className = 'sync-status synced';
    } else {
        syncStatus.textContent = 'Never synced';
        syncStatus.className = 'sync-status not-synced';
    }
}

// Task 3: Toggle conflict resolution
function toggleConflictResolution() {
    conflictResolutionEnabled = !conflictResolutionEnabled;
    const toggleBtn = document.getElementById('toggleConflictResolution');
    toggleBtn.textContent = `Conflict Resolution: ${conflictResolutionEnabled ? 'ON' : 'OFF'}`;
    toggleBtn.className = conflictResolutionEnabled ? 'enabled' : 'disabled';
    
    showNotification(`Conflict resolution ${conflictResolutionEnabled ? 'enabled' : 'disabled'}`, 'info');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Task 2: Populate categories dropdown
    populateCategories();
    
    // Task 3: Update sync status
    updateSyncStatus();
    
    // Task 3: Set up periodic syncing (every 45 seconds)
    setInterval(syncQuotes, 45000);
    
    // Task 3: Initial sync after 3 seconds
    setTimeout(syncQuotes, 3000);
    
    // Apply saved filter or show appropriate content
    if (currentFilter && currentFilter !== 'all') {
        document.getElementById('categoryFilter').value = currentFilter;
        filterQuotes();
    } else {
        const lastViewed = sessionStorage.getItem('lastViewed');
        if (lastViewed) {
            document.getElementById('quoteDisplay').innerHTML = lastViewed;
        } else {
            showRandomQuote();
        }
    }
    
    // Task 0: Add event listener to new quote button
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    
    console.log('Dynamic Quote Generator initialized successfully!');
});