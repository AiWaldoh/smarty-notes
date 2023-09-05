import { StorageManager } from './StorageManager.js';

export class LocalStorageManager extends StorageManager {
    constructor(key) {
        super();
        this.key = key;  // The key used to save/retrieve data from local storage
    }

    save(data) {
        localStorage.setItem(this.key, JSON.stringify(data));
    }

    load() {
        const savedData = localStorage.getItem(this.key);
        return savedData ? JSON.parse(savedData) : null;
    }
}
