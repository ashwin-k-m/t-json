class HybridTrie {
    constructor() {
        this.data = {}; // JSON-like structure
        this.idCounter = 1; // Unique ID counter
        this.wordMap = {}; // Stores word-to-ID mapping
    }

    generateUniqueId(word) {
        if (!this.wordMap[word]) {
            this.wordMap[word] = this.idCounter++ + '_';
        }
        return this.wordMap[word];
    }

    insertWord(word) {
        if (!word) return;
        
        let base = word.slice(0, 2); // Use first two letters as base address
        let uniqueId = this.generateUniqueId(word);
        
        if (!this.data[base]) this.data[base] = [];
        
        let arr = this.data[base];
        if (!arr.some(item => item.startsWith(uniqueId))) {
            arr.push(uniqueId + word);
        }
    }

    getWord(baseAddress, uniqueId) {
        let arr = this.data[baseAddress];
        if (!arr) return null;

        for (let item of arr) {
            if (item.startsWith(uniqueId)) {
                return item.replace(uniqueId, '');
            }
        }
        return null;
    }

    updateWord(baseAddress, uniqueId, newWord) {
        let arr = this.data[baseAddress];
        if (!arr) return false;
        
        let index = arr.findIndex(item => item.startsWith(uniqueId));
        if (index !== -1) {
            arr[index] = uniqueId + newWord;
            return true;
        }
        return false;
    }

    deleteWord(baseAddress, uniqueId) {
        let arr = this.data[baseAddress];
        if (!arr) return false;

        let index = arr.findIndex(item => item.startsWith(uniqueId));
        if (index !== -1) {
            arr.splice(index, 1);
            return true;
        }
        return false;
    }

    saveToLocalStorage() {
        if (typeof localStorage !== "undefined") {
            localStorage.setItem('hybridTrieData', JSON.stringify(this.data));
            localStorage.setItem('hybridTrieIdCounter', this.idCounter);
            localStorage.setItem('hybridTrieWordMap', JSON.stringify(this.wordMap));
        }
    }

    loadFromLocalStorage() {
        if (typeof localStorage !== "undefined") {
            this.data = JSON.parse(localStorage.getItem('hybridTrieData')) || {};
            this.idCounter = parseInt(localStorage.getItem('hybridTrieIdCounter')) || 1;
            this.wordMap = JSON.parse(localStorage.getItem('hybridTrieWordMap')) || {};
        }
    }

    saveToFile(filename = 'trieData.json') {
        const fs = require('fs');
        fs.writeFileSync(filename, JSON.stringify({ data: this.data, idCounter: this.idCounter, wordMap: this.wordMap }, null, 2));
    }

    loadFromFile(filename = 'trieData.json') {
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
const trie = new HybridTrie();
trie.insertWord("bat");
trie.insertWord("bath");
trie.insertWord("dog");

let batId = trie.generateUniqueId("bat");
console.log(trie.getWord("ba", batId)); // "bat"

// Update "bat" to "batman"
trie.updateWord("ba", batId, "batman");
console.log(trie.getWord("ba", batId)); // "batman"

// Save and load from localStorage (Web)
trie.saveToLocalStorage();
trie.loadFromLocalStorage();

// Save and load from file (Node.js / Native)
trie.saveToFile();
trie.loadFromFile();
