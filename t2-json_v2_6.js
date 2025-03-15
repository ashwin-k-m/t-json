const readline = require('readline-sync');

class NestedTrie {
    constructor() {
        this.data = {}; // Main storage
        this.idCounter = 1; // Unique ID counter
        this.savedAddresses = []; // Store returned addresses
    }

    // Generate unique ID
    generateUniqueId() {
        return this.idCounter++;
    }

    // Insert a word using nested structure
    insertWord(word) {
        if (!word) return;

        let current = this.data;
        let address = [];
        let prefix = "";
        
        for (let i = 0; i < word.length; i++) {
            let char = word[i];
            prefix += char;
            
            if (!current[char]) {
                current[char] = [{}];
            }
            
            if (i === word.length - 1) {
                let uniqueId = this.generateUniqueId() + "_" + char;
                current[char][0] = { [uniqueId]: [] };
                address.push(uniqueId);
            } else {
                address.push(char);
            }
            current = current[char][0];
        }

        let fullAddress = this.returnAddress(address);
        this.savedAddresses.push(fullAddress);
        return fullAddress;
    }

    // Retrieve a word using its prefix
    getWord(prefix) {
        let current = this.data;
        for (let char of prefix) {
            if (!current[char]) return null;
            current = current[char][0];
        }
        return current;
    }

    // Update a word
    updateWord(prefix, newWord) {
        let deleteResult = this.deleteWord(prefix);
        if (deleteResult) {
            return this.insertWord(newWord);
        }
        return false;
    }

    // Delete a word
    deleteWord(prefix) {
        let current = this.data;
        for (let char of prefix) {
            if (!current[char]) return false;
            current = current[char][0];
        }
        return true;
    }

    // Return address function
    returnAddress(path) {
        return path.reduceRight((acc, key) => ({ [key]: [acc] }), {});
    }

    // Display all stored words
    displayWords() {
        console.log("Stored Data:", JSON.stringify(this.data, null, 2));
    }

    // Display all saved addresses
    displayAddresses() {
        console.log("Saved Addresses:", JSON.stringify(this.savedAddresses, null, 2));
    }

    // Save to localStorage (Web)
    saveToLocalStorage() {
        if (typeof localStorage !== "undefined") {
            localStorage.setItem('nestedTrieData', JSON.stringify(this.data));
            localStorage.setItem('nestedTrieIdCounter', this.idCounter);
            localStorage.setItem('nestedTrieSavedAddresses', JSON.stringify(this.savedAddresses));
        }
    }

    // Load from localStorage (Web)
    loadFromLocalStorage() {
        if (typeof localStorage !== "undefined") {
            this.data = JSON.parse(localStorage.getItem('nestedTrieData')) || {};
            this.idCounter = parseInt(localStorage.getItem('nestedTrieIdCounter')) || 1;
            this.savedAddresses = JSON.parse(localStorage.getItem('nestedTrieSavedAddresses')) || [];
        }
    }

    // Save to a file (Native Devices)
    saveToFile(filename = 'nestedTrie.json') {
        const fs = require('fs');
        fs.writeFileSync(filename, JSON.stringify({ data: this.data, idCounter: this.idCounter, savedAddresses: this.savedAddresses }, null, 2));
    }

    // Load from a file (Native Devices)
    loadFromFile(filename = 'nestedTrie.json') {
        const fs = require('fs');
        if (fs.existsSync(filename)) {
            let loadedData = JSON.parse(fs.readFileSync(filename, 'utf8'));
            this.data = loadedData.data || {};
            this.idCounter = loadedData.idCounter || 1;
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
            console.log("Inserted at:", JSON.stringify(trie.insertWord(word), null, 2));
            break;
        case '2':
            let prefix = readline.question("Enter prefix to retrieve: ");
            console.log("Retrieved:", trie.getWord(prefix));
            break;
        case '3':
            let oldPrefix = readline.question("Enter prefix to update: ");
            let newWord = readline.question("Enter new word: ");
            console.log("Updated Address:", JSON.stringify(trie.updateWord(oldPrefix, newWord), null, 2));
            break;
        case '4':
            let delPrefix = readline.question("Enter prefix to delete: ");
            console.log("Deleted:", trie.deleteWord(delPrefix));
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
