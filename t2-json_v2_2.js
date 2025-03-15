const readline = require('readline-sync');

class NestedTrie {
    constructor() {
        this.data = {}; // Main storage
        this.idCounter = 1; // Unique ID counter
        this.wordMap = {}; // Map words to IDs
        this.savedAddresses = []; // Store returned addresses
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
        let address = [];

        for (let char of word) {
            if (!current[char]) {
                current[char] = {}; // Store children in an object
            }
            address.push(char);
            current = current[char]; // Move deeper into the nested structure
        }

        // Store unique ID at the final character
        let finalId = uniqueId + word;
        if (!current["_words"]) current["_words"] = [];
        current["_words"].push(finalId);
        
        let fullAddress = this.returnAddress(address);
        this.savedAddresses.push(fullAddress);
        return fullAddress;
    }

    // Retrieve a word using its prefix & unique ID
    getWord(prefix, uniqueId) {
        let current = this.data;
        for (let char of prefix) {
            if (!current[char]) return null;
            current = current[char];
        }
        return current["_words"] ? current["_words"].find(word => word.startsWith(uniqueId)).replace(uniqueId, '') : null;
    }

    // Update a word
    updateWord(prefix, uniqueId, newWord) {
        let current = this.data;
        for (let char of prefix) {
            if (!current[char]) return false;
            current = current[char];
        }

        if (current["_words"]) {
            let index = current["_words"].findIndex(word => word.startsWith(uniqueId));
            if (index !== -1) {
                current["_words"][index] = uniqueId + newWord;
                let address = this.returnAddress(newWord.split(''));
                this.savedAddresses.push(address);
                return address;
            }
        }
        return false;
    }

    // Delete a word
    deleteWord(prefix, uniqueId) {
        let current = this.data;
        for (let char of prefix) {
            if (!current[char]) return false;
            current = current[char];
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

    // Return address function
    returnAddress(path) {
        return path.join(' -> ');
    }

    // Display all stored words
    displayWords() {
        console.log("Stored Data:", JSON.stringify(this.data, null, 2));
    }

    // Display all saved addresses
    displayAddresses() {
        console.log("Saved Addresses:", this.savedAddresses);
    }

    // Save to localStorage (Web)
    saveToLocalStorage() {
        if (typeof localStorage !== "undefined") {
            localStorage.setItem('nestedTrieData', JSON.stringify(this.data));
            localStorage.setItem('nestedTrieIdCounter', this.idCounter);
            localStorage.setItem('nestedTrieWordMap', JSON.stringify(this.wordMap));
            localStorage.setItem('nestedTrieSavedAddresses', JSON.stringify(this.savedAddresses));
        }
    }

    // Load from localStorage (Web)
    loadFromLocalStorage() {
        if (typeof localStorage !== "undefined") {
            this.data = JSON.parse(localStorage.getItem('nestedTrieData')) || {};
            this.idCounter = parseInt(localStorage.getItem('nestedTrieIdCounter')) || 1;
            this.wordMap = JSON.parse(localStorage.getItem('nestedTrieWordMap')) || {};
            this.savedAddresses = JSON.parse(localStorage.getItem('nestedTrieSavedAddresses')) || [];
        }
    }

    // Save to a file (Native Devices)
    saveToFile(filename = 'nestedTrie.json') {
        const fs = require('fs');
        fs.writeFileSync(filename, JSON.stringify({ data: this.data, idCounter: this.idCounter, wordMap: this.wordMap, savedAddresses: this.savedAddresses }, null, 2));
    }

    // Load from a file (Native Devices)
    loadFromFile(filename = 'nestedTrie.json') {
        const fs = require('fs');
        if (fs.existsSync(filename)) {
            let loadedData = JSON.parse(fs.readFileSync(filename, 'utf8'));
            this.data = loadedData.data || {};
            this.idCounter = loadedData.idCounter || 1;
            this.wordMap = loadedData.wordMap || {};
            this.savedAddresses = loadedData.savedAddresses || [];
        }
    }
}

// Menu-driven execution
const trie = new NestedTrie();

while (true) {
    console.log("\n1. Insert Word");
    console.log("2. Retrieve Word");
    console.log("3. Update Word");
    console.log("4. Delete Word");
    console.log("5. Display Stored Words");
    console.log("6. Display Saved Addresses");
    console.log("7. Save to File");
    console.log("8. Load from File");
    console.log("9. Exit");
    let choice = readline.question("Enter your choice: ");

    switch (choice) {
        case '1':
            let word = readline.question("Enter word to insert: ");
            console.log("Inserted at:", trie.insertWord(word));
            break;
        case '2':
            let prefix = readline.question("Enter prefix: ");
            let id = readline.question("Enter unique ID: ");
            console.log("Retrieved Word:", trie.getWord(prefix, id));
            break;
        case '3':
            let oldPrefix = readline.question("Enter prefix: ");
            let oldId = readline.question("Enter unique ID: ");
            let newWord = readline.question("Enter new word: ");
            console.log("Updated Address:", trie.updateWord(oldPrefix, oldId, newWord));
            break;
        case '4':
            let delPrefix = readline.question("Enter prefix: ");
            let delId = readline.question("Enter unique ID: ");
            console.log("Deleted:", trie.deleteWord(delPrefix, delId));
            break;
        case '5':
            trie.displayWords();
            break;
        case '6':
            trie.displayAddresses();
            break;
        case '7':
            trie.saveToFile();
            console.log("Data saved to file.");
            break;
        case '8':
            trie.loadFromFile();
            console.log("Data loaded from file.");
            break;
        case '9':
            process.exit(0);
        default:
            console.log("Invalid choice, try again.");
    }
}
