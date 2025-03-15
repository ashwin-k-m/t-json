const readline = require('readline');

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

        for (let char of word) {
            if (!current[char]) {
                current[char] = [{}]; // Store children in an object inside an array
            }
            current = current[char][0]; // Move deeper into the nested structure
        }

        // Store unique ID at the final character
        if (!current["_words"]) current["_words"] = [];
        current["_words"].push(uniqueId + word);

        // Save the returned address
        let address = this.returnAddress(word);
        this.savedAddresses.push(address);
        return address;
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
                
                // Save the returned address
                let address = this.returnAddress(newWord);
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

    // Return address function
    returnAddress(word) {
        return `Address_${this.generateUniqueId(word)}`;
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

// User Interaction Menu
const trie = new NestedTrie();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function showMenu() {
    console.log("\nMenu:");
    console.log("1. Insert Word");
    console.log("2. Retrieve Word");
    console.log("3. Update Word");
    console.log("4. Delete Word");
    console.log("5. Display Stored Words");
    console.log("6. Display Saved Addresses");
    console.log("7. Exit");
    rl.question("Choose an option: ", handleMenu);
}

function handleMenu(option) {
    switch (option) {
        case '1':
            rl.question("Enter word to insert: ", word => {
                console.log("Inserted at:", trie.insertWord(word));
                showMenu();
            });
            break;
        case '2':
            rl.question("Enter prefix: ", prefix => {
                rl.question("Enter unique ID: ", id => {
                    console.log("Retrieved:", trie.getWord(prefix, id));
                    showMenu();
                });
            });
            break;
        case '3':
            rl.question("Enter prefix: ", prefix => {
                rl.question("Enter unique ID: ", id => {
                    rl.question("Enter new word: ", newWord => {
                        console.log("Updated:", trie.updateWord(prefix, id, newWord));
                        showMenu();
                    });
                });
            });
            break;
        case '4':
            rl.question("Enter prefix: ", prefix => {
                rl.question("Enter unique ID: ", id => {
                    console.log("Deleted:", trie.deleteWord(prefix, id));
                    showMenu();
                });
            });
            break;
        case '5':
            trie.displayWords();
            showMenu();
            break;
        case '6':
            trie.displayAddresses();
            showMenu();
            break;
        case '7':
            rl.close();
            break;
        default:
            showMenu();
    }
}

showMenu();
