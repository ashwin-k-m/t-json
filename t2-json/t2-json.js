class NestedTrie {
    constructor() {
        this.data = {}; // Main storage
        this.idCounter = 1; // Unique ID counter
        this.wordMap = {}; // Map words to IDs
    }

    // Generate unique ID
    generateUniqueId(word) {
        if (!this.wordMap[word]) {
            this.wordMap[word] = this.idCounter++ + '_';
        }
        return this.wordMap[word];
    }

    // Insert a word using nested structure
    insertWord(word) {
        if (!word) return;

        let current = this.data;
        let uniqueId = this.generateUniqueId(word);

        for (let char of word) {
            if (!current[char]) {
                current[char] = [{}]; // Store children in an object inside an array
            }
            current = current[char][0]; // Move deeper into the nested structure
        }

        // Store unique ID at the final character
        if (!current["_words"]) current["_words"] = [];
        current["_words"].push(uniqueId + word);
    }

    // Retrieve a word using its prefix & unique ID
    getWord(prefix, uniqueId) {
        let current = this.data;
        for (let char of prefix) {
            if (!current[char]) return null;
            current = current[char][0];
        }
        return current["_words"] ? current["_words"].find(word => word.startsWith(uniqueId)).replace(uniqueId, '') : null;
    }

    // Update a word
    updateWord(prefix, uniqueId, newWord) {
        let current = this.data;
        for (let char of prefix) {
            if (!current[char]) return false;
            current = current[char][0];
        }

        if (current["_words"]) {
            let index = current["_words"].findIndex(word => word.startsWith(uniqueId));
            if (index !== -1) {
                current["_words"][index] = uniqueId + newWord;
                return true;
            }
        }
        return false;
    }

    // Delete a word
    deleteWord(prefix, uniqueId) {
        let current = this.data;
        for (let char of prefix) {
            if (!current[char]) return false;
            current = current[char][0];
        }

        if (current["_words"]) {
            let index = current["_words"].findIndex(word => word.startsWith(uniqueId));
            if (index !== -1) {
                current["_words"].splice(index, 1);
                return true;
            }
        }
        return false;
    }

    // Save to localStorage (Web)
    saveToLocalStorage() {
        if (typeof localStorage !== "undefined") {
            localStorage.setItem('nestedTrieData', JSON.stringify(this.data));
            localStorage.setItem('nestedTrieIdCounter', this.idCounter);
            localStorage.setItem('nestedTrieWordMap', JSON.stringify(this.wordMap));
        }
    }

    // Load from localStorage (Web)
    loadFromLocalStorage() {
        if (typeof localStorage !== "undefined") {
            this.data = JSON.parse(localStorage.getItem('nestedTrieData')) || {};
            this.idCounter = parseInt(localStorage.getItem('nestedTrieIdCounter')) || 1;
            this.wordMap = JSON.parse(localStorage.getItem('nestedTrieWordMap')) || {};
        }
    }

    // Save to a file (Native Devices)
    saveToFile(filename = 'nestedTrie.json') {
        const fs = require('fs');
        fs.writeFileSync(filename, JSON.stringify({ data: this.data, idCounter: this.idCounter, wordMap: this.wordMap }, null, 2));
    }

    // Load from a file (Native Devices)
    loadFromFile(filename = 'nestedTrie.json') {
        const fs = require('fs');
        if (fs.existsSync(filename)) {
            let loadedData = JSON.parse(fs.readFileSync(filename, 'utf8'));
            this.data = loadedData.data || {};
            this.idCounter = loadedData.idCounter || 1;
            this.wordMap = loadedData.wordMap || {};
        }
    }
}

// Example Usage
const trie = new NestedTrie();

// Insert words
trie.insertWord("hat");
trie.insertWord("has");

// Retrieve words
let hatId = trie.generateUniqueId("hat");
console.log(trie.getWord("ha", hatId)); // "hat"

// Update "hat" to "hatch"
trie.updateWord("ha", hatId, "hatch");
console.log(trie.getWord("ha", hatId)); // "hatch"

// Save and load from localStorage (Web)
trie.saveToLocalStorage();
trie.loadFromLocalStorage();

// Save and load from file (Native)
trie.saveToFile();
trie.loadFromFile();
