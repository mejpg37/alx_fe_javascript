// Array of quote objects - Task 0
let quotes = loadQuotesFromStorage();
let currentFilter = localStorage.getItem('currentFilter') || 'all';
let lastSyncTime = localStorage.getItem('lastSyncTime') || null;
let conflictResolutionEnabled = true;

// Simulated server quotes - Task 3
const serverQuotes = [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" },
    { text: "Life is what happens to you while you're busy making other plans.", category: "Life" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { text: "Server-side quote: Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live.", category: "Programming" },
    { text: "Simplicity is the ultimate sophistication.", category: "Design" }
];

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
        
        // Task 3: Simulate syncing with server after adding quote
        setTimeout(syncWithServer, 1000);
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
                setTimeout(syncWithServer, 1500);
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

// Task 3: Simulate server sync
function syncWithServer() {
    showNotification('Syncing with server...', 'info');
    
    // Simulate API call delay
    setTimeout(() => {
        const conflicts = findConflicts(quotes, serverQuotes);
        
        if (conflicts.length > 0) {
            showNotification(`Found ${conflicts.length} conflicts during sync`, 'warning');
            resolveConflicts(conflicts);
        } else {
            // Merge server quotes with local quotes
            const mergedQuotes = mergeQuotes(quotes, serverQuotes);
            const newQuotesCount = mergedQuotes.length - quotes.length;
            quotes = mergedQuotes;
            saveQuotes();
            
            if (newQuotesCount > 0) {
                showNotification(`Sync completed! Added ${newQuotesCount} new quotes from server.`, 'success');
            } else {
                showNotification('Sync completed! Data is up to date.', 'success');
            }
            showRandomQuote();
        }
        
        lastSyncTime = new Date().toISOString();
        localStorage.setItem('lastSyncTime', lastSyncTime);
        updateSyncStatus();
    }, 2000);
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
    
    saveQuotes();
    showNotification(`Automatically resolved ${resolvedCount} conflicts.`, 'success');
    showRandomQuote();
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
    const conflicts = findConflicts(quotes, serverQuotes);
    
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
    
    // Task 3: Set up periodic syncing (every 30 seconds)
    setInterval(syncWithServer, 30000);
    
    // Task 3: Initial sync after 2 seconds
    setTimeout(syncWithServer, 2000);
    
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