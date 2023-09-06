let tabContent = {};
const page = document.querySelector('.page');
const tabBar = document.querySelector('.tab-bar');
let activeTabId = "1";  // Default active tab

document.addEventListener('DOMContentLoaded', function () {
    initializeTools();
    initializeFontSizeDropdown();
    initializeFontDropdown();

    if (!localStorage.getItem('noteAppTabContent')) {
        tabContent = {
            "1": {
                name: 'Untitled',
                content: page.innerHTML || ''
            }
        };
        activeTabId = "1";
        saveTabsToLocalStorage();
    } else {
        loadTabsFromLocalStorage();  // Load tabs when the page loads
    }

    attachTabBarListeners();    // Attach event listeners to the tab bar

    // Save content to tabContent and local storage whenever it changes
    page.addEventListener('input', function () {
        tabContent[activeTabId].content = page.innerHTML;
        saveTabsToLocalStorage();
    });
});



// Save content to tabContent and local storage whenever it changes
page.addEventListener('input', function () {
    tabContent[activeTabId].content = page.innerHTML;
    saveTabsToLocalStorage();
});


function initializeTools() {
    const tools = document.querySelectorAll('.tool');
    tools.forEach(tool => {
        tool.addEventListener('click', function (e) {
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
    document.querySelector('.font-size-dropdown').addEventListener('change', function () {
        const size = this.value;
        document.execCommand('fontSize', false, size);
    });
}

function initializeFontDropdown() {
    document.querySelector('.font-dropdown').addEventListener('change', function () {
        const font = this.value;
        document.execCommand('fontName', false, font);
    });
}

function saveToFile(content) {
    const blob = new Blob([content], { type: 'text/html' });
    const a = document.getElementById('downloadAnchorElem');
    const defaultName = 'note.html';
    const filename = prompt("Enter a filename:", defaultName) || defaultName;

    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    // Set the active tab's name to the saved file's name (without extension)
    const filenameWithoutExtension = filename.replace(/\.[^/.]+$/, "");
    tabContent[activeTabId].name = filenameWithoutExtension;  // Update tab name in tabContent
    const activeTab = document.querySelector('.tab.active');
    activeTab.innerHTML = filenameWithoutExtension + ' <span class="close-tab">X</span>';
    saveTabsToLocalStorage();  // Save updated tabContent to local storage
}

document.getElementById('saveBtn').addEventListener('click', function () {
    const content = page.innerHTML;
    saveToFile(content);
    tabContent[activeTabId].content = content;  // Save current content to tabContent object
    saveTabsToLocalStorage();  // Save updated tabContent to local storage
});

document.getElementById('loadBtn').addEventListener('click', function () {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function () {
            page.innerHTML = reader.result;
            tabContent[activeTabId].content = reader.result;  // Save loaded content to tabContent object
            saveTabsToLocalStorage();  // Save updated tabContent to local storage
            // Update the active tab's name based on file name (without extension)
            const filenameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
            tabContent[activeTabId].name = filenameWithoutExtension;  // Update tab name in tabContent
            const activeTab = document.querySelector('.tab.active');
            activeTab.innerHTML = filenameWithoutExtension + ' <span class="close-tab">X</span>';
        };
        reader.readAsText(file);
    }
});

function saveTabsToLocalStorage() {
    localStorage.setItem('noteAppTabContent', JSON.stringify(tabContent));
}

function loadTabsFromLocalStorage() {
    const storedTabContent = localStorage.getItem('noteAppTabContent');
    if (storedTabContent) {
        tabContent = JSON.parse(storedTabContent);

        // Clear existing tabs except for the 'New Tab' button
        const existingTabs = document.querySelectorAll('.tab');
        existingTabs.forEach(tab => tab.remove());

        // Populate the tabs from the stored data
        for (const tabId in tabContent) {
            const newTab = document.createElement('button');
            newTab.className = 'tab';
            newTab.dataset.tabId = tabId;
            newTab.innerHTML = tabContent[tabId].name + ' <span class="close-tab">X</span>';
            tabBar.insertBefore(newTab, document.getElementById('newTabBtn'));
        }

        // Set content of the active tab
        page.innerHTML = tabContent[activeTabId].content || '';
    }
}


function attachTabBarListeners() {
    // Listener for switching tabs
    tabBar.addEventListener('click', function (event) {
        if (event.target.classList.contains('tab')) {
            const selectedTabId = event.target.dataset.tabId;
            makeTabActive(selectedTabId);
            page.innerHTML = tabContent[selectedTabId] ? tabContent[selectedTabId].content : "";
        }
    });

    // Listener for closing tabs
    tabBar.addEventListener('click', function (event) {
        if (event.target.classList.contains('close-tab')) {
            const tabToClose = event.target.parentElement;
            delete tabContent[tabToClose.dataset.tabId];  // Remove from tabContent object
            saveTabsToLocalStorage();  // Update local storage
            tabToClose.remove();
        }
    });
}



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
    page.innerHTML = tabContent[tabId] && tabContent[tabId].content ? tabContent[tabId].content : '';
}

document.getElementById('newTabBtn').addEventListener('click', function () {
    const newTabId = (Math.random() + 1).toString(36).substring(7);
    tabContent[newTabId] = {
        name: 'Untitled',  // Default name
        content: ''        // Default content
    };
    saveTabsToLocalStorage();  // Save updated tabContent to local storage

    const newTab = document.createElement('button');
    newTab.className = 'tab';
    newTab.dataset.tabId = newTabId;
    newTab.innerHTML = 'Untitled <span class="close-tab">X</span>';
    tabBar.insertBefore(newTab, this);
    makeTabActive(newTabId);
    document.querySelector('.page').innerHTML = '';
});

async function smartFormat(content) {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${CONFIG.API_KEY}`,  // Use the key from the config file
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                max_tokens: 2048,
                temperature: 0.7,
                messages: [{ role: "user", content: 'format this text' + content }],
            }),
        });

        if (!response.ok) {
            console.error(`Error: ${response.statusText}`);
            return;
        }

        const data = await response.json();
        console.log(data);

        // Assuming you have a method to update the content of the current tab
        updateTabContent(data.choices[0].message.content);
    } catch (e) {
        console.error(e);
    }
}
document.getElementById('smartFormatBtn').addEventListener('click', function() {
    const currentContent = tabContent[activeTabId].content;
    smartFormat(currentContent);
});
function updateTabContent(formattedContent) {
    // 1. Update the tabContent object
    tabContent[activeTabId].content = formattedContent;

    // 2. Update the displayed content
    page.innerHTML = formattedContent;

    // 3. Save the updated content to local storage
    saveTabsToLocalStorage();
}
