
import { LocalStorageManager } from './LocalStorageManager.js';

// Initialize when DOM is fully loaded
let tabContent = {};
const page = document.querySelector('.page');
document.addEventListener('DOMContentLoaded', function() {
    
    initializeTools();
    initializeFontSizeDropdown();
    initializeFontDropdown();
    loadSavedContent();
});

function initializeTools() {
    const tools = document.querySelectorAll('.tool');
    tools.forEach(tool => {
        tool.addEventListener('click', function(e) {
            const command = this.getAttribute('data-command');
            document.execCommand(command, false, null);
            this.classList.toggle('active');
            deactivateOtherTools(this);
        });
    });
}

function deactivateOtherTools(activeTool) {
    const tools = document.querySelectorAll('.tool');
    tools.forEach(tool => {
        if (tool !== activeTool) {
            tool.classList.remove('active');
        }
    });
}

function initializeFontSizeDropdown() {
    document.querySelector('.font-size-dropdown').addEventListener('change', function() {
        const size = this.value;
        document.execCommand('fontSize', false, size);
    });
}

function initializeFontDropdown() {
    document.querySelector('.font-dropdown').addEventListener('change', function() {
        const font = this.value;
        document.execCommand('fontName', false, font);
    });
}

function loadSavedContent() {
    const storage = new LocalStorageManager('noteAppData');
    
    
    // Save content on input
    
    
    page.addEventListener('input', function() {
        tabContent[activeTabId] = this.innerHTML;
        localStorage.setItem('noteAppTabContent', JSON.stringify(tabContent));
    });

    // Load saved content
    const savedContent = storage.load();
    if (savedContent) {
        page.innerHTML = savedContent;
    }
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

const storedTabContent = localStorage.getItem('noteAppTabContent');
if (storedTabContent) {
    tabContent = JSON.parse(storedTabContent);
    page.innerHTML = tabContent[activeTabId] || "";
}



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
        const selectedTabId = event.target.dataset.tabId;
        makeTabActive(selectedTabId);
        page.innerHTML = tabContent[selectedTabId] || "";  // Load content or default to empty string
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
    tabContent[newTabId] = "";  // Initialize content for the new tab

    const newTab = document.createElement('button');
    newTab.className = 'tab';
    newTab.dataset.tabId = newTabId;
    
    newTab.innerHTML = 'Untitled <span class="close-tab">X</span>';
    tabBar.insertBefore(newTab, this);
    makeTabActive(newTabId);
    
    // Clear the content of .page when a new tab is created
    document.querySelector('.page').innerHTML = '';
});