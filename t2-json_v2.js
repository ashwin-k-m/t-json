const fs = require('fs');

class NestedTrie {
    constructor() {
        this.data = {}; // Main storage
        this.idCounter = 1; // Unique ID counter
        this.wordMap = {}; // Map words to IDs
        this.addresses = {}; // Stores returned addresses
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
        
        // Store the returned address
        this.addresses[word] = uniqueId;
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
                this.addresses[newWord] = uniqueId; // Update stored address
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
                delete this.addresses[uniqueId]; // Remove stored address
                return true;
            }
        }
        return false;
    }

    // Display all stored words
    displayWords() {
        console.log("Stored Data:", JSON.stringify(this.data, null, 2));
    }

    // Return the stored addresses
    returnAddress() {
        return this.addresses;
    }

    // Save to localStorage (Web)
    saveToLocalStorage() {
        if (typeof localStorage !== "undefined") {
            localStorage.setItem('nestedTrieData', JSON.stringify(this.data));
            localStorage.setItem('nestedTrieIdCounter', this.idCounter);
            localStorage.setItem('nestedTrieWordMap', JSON.stringify(this.wordMap));
            localStorage.setItem('nestedTrieAddresses', JSON.stringify(this.addresses));
        }
    }

    // Load from localStorage (Web)
    loadFromLocalStorage() {
        if (typeof localStorage !== "undefined") {
            this.data = JSON.parse(localStorage.getItem('nestedTrieData')) || {};
            this.idCounter = parseInt(localStorage.getItem('nestedTrieIdCounter')) || 1;
            this.wordMap = JSON.parse(localStorage.getItem('nestedTrieWordMap')) || {};
            this.addresses = JSON.parse(localStorage.getItem('nestedTrieAddresses')) || {};
        }
    }

    // Save to a file (Native Devices)
    saveToFile(filename = 'nestedTrie.json') {
        fs.writeFileSync(filename, JSON.stringify({ data: this.data, idCounter: this.idCounter, wordMap: this.wordMap, addresses: this.addresses }, null, 2));
    }

    // Load from a file (Native Devices)
    loadFromFile(filename = 'nestedTrie.json') {
        if (fs.existsSync(filename)) {
            let loadedData = JSON.parse(fs.readFileSync(filename, 'utf8'));
            this.data = loadedData.data || {};
            this.idCounter = loadedData.idCounter || 1;
            this.wordMap = loadedData.wordMap || {};
            this.addresses = loadedData.addresses || {};
        }
    }
}

// CLI Menu
const trie = new NestedTrie();
const readline = require('readline-sync');

function menu() {
    while (true) {
        console.log("\n1. Insert Word\n2. Get Word\n3. Update Word\n4. Delete Word\n5. Display Words\n6. Show Addresses\n7. Save\n8. Load\n9. Exit");
        let choice = readline.question("Enter your choice: ");

        switch (choice) {
            case '1':
                let word = readline.question("Enter word to insert: ");
                trie.insertWord(word);
                break;
            case '2':
                let prefix = readline.question("Enter prefix: ");
                let id = readline.question("Enter unique ID: ");
                console.log("Word:", trie.getWord(prefix, id));
                break;
            case '3':
                let oldPrefix = readline.question("Enter old prefix: ");
                let oldId = readline.question("Enter old unique ID: ");
                let newWord = readline.question("Enter new word: ");
                trie.updateWord(oldPrefix, oldId, newWord);
                break;
            case '4':
                let delPrefix = readline.question("Enter prefix: ");
                let delId = readline.question("Enter unique ID: ");
                trie.deleteWord(delPrefix, delId);
                break;
            case '5':
                trie.displayWords();
                break;
            case '6':
                console.log("Stored Addresses:", trie.returnAddress());
                break;
            case '7':
                trie.saveToFile();
                break;
            case '8':
                trie.loadFromFile();
                break;
            case '9':
                process.exit();
            default:
                console.log("Invalid choice!");
        }
    }
}

menu();
