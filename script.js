import { LocalStorageManager } from './LocalStorageManager.js';

document.querySelector('.page').focus();
document.addEventListener('DOMContentLoaded', function() {
    let tools = document.querySelectorAll('.tool');

    tools.forEach(function(tool) {
        tool.addEventListener('click', function(e) {
            let command = this.getAttribute('data-command');
            document.execCommand(command, false, null);
            this.classList.toggle('active');
        });
    });

    tools.forEach(function(toolA) {
        toolA.addEventListener('click', function() {
            tools.forEach(function(toolB) {
                if (toolA !== toolB) {
                    toolB.classList.remove('active');
                }
            });
        });
    });
});
document.querySelector('.font-size-dropdown').addEventListener('change', function() {
    let size = this.value;
    document.execCommand('fontSize', false, size);
});
const storage = new LocalStorageManager('noteAppData');

document.querySelector('.page').addEventListener('input', function() {
    storage.save(this.innerHTML);
});

document.addEventListener('DOMContentLoaded', function() {
    const savedContent = storage.load();
    if (savedContent) {
        document.querySelector('.page').innerHTML = savedContent;
    }
});
const saveKey = 'noteAppUUID'; // Key to save/retrieve UUID from local storage

// Function to generate a UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


function saveToFile(content) {
    const blob = new Blob([content], { type: 'text/html' });
    const a = document.getElementById('downloadAnchorElem');
    
    // Prompt the user for a filename
    const defaultName = 'note.html';
    const filename = prompt("Enter a filename:", defaultName) || defaultName;
    
    a.href = URL.createObjectURL(blob);
    a.download = filename;  // use the provided filename or the default name
    a.click();
    // Set the active tab's name to the saved file's name (without extension)
    const filenameWithoutExtension = filename.replace(/\.[^/.]+$/, "");
    const activeTab = document.querySelector('.tab.active');
    activeTab.innerHTML = filenameWithoutExtension + ' <span class="close-tab">X</span>';
}

document.getElementById('saveBtn').addEventListener('click', function() {
    const content = document.querySelector('.page').innerHTML;
    saveToFile(content);
});
document.getElementById('loadBtn').addEventListener('click', function() {
    document.getElementById('fileInput').click();
});


document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.querySelector('.page').innerHTML = e.target.result;
            // Set the active tab's name to the loaded file's name (without extension)
            const filenameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
            const activeTab = document.querySelector('.tab.active');
            activeTab.innerHTML = filenameWithoutExtension + ' <span class="close-tab">X</span>';
        };
        reader.readAsText(file);
    }
});

const tabBar = document.querySelector('.tab-bar');
let activeTabId = "1"; // Default active tab

// Function to make a tab active
function makeTabActive(tabId) {
    const allTabs = document.querySelectorAll('.tab');
    allTabs.forEach(tab => {
        if (tab.dataset.tabId === tabId) {
            tab.classList.add('active');
            activeTabId = tabId;
        } else {
            tab.classList.remove('active');
        }
    });
}

tabBar.addEventListener('click', function(event) {
    if (event.target.classList.contains('tab')) {
        makeTabActive(event.target.dataset.tabId);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const tabBar = document.querySelector('.tab-bar');
    
    tabBar.addEventListener('click', function(event) {
        if (event.target.classList.contains('close-tab')) {
            const tabToClose = event.target.parentElement;
            tabToClose.remove();
            
        }
    });
});
document.getElementById('newTabBtn').addEventListener('click', function() {
    const newTabId = (Math.random() + 1).toString(36).substring(7);
    const newTab = document.createElement('button');
    newTab.className = 'tab';
    newTab.dataset.tabId = newTabId;
    
    newTab.innerHTML = 'Untitled <span class="close-tab">X</span>';
    tabBar.insertBefore(newTab, this);
    makeTabActive(newTabId);
    
    // Clear the content of .page when a new tab is created
    document.querySelector('.page').innerHTML = '';
});