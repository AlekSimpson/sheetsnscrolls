var characters = {}

// Navigation functionality
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show the selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    // Update URL without page reload
    history.pushState({page: pageId}, '', `#${pageId}`);
}

// Handle browser back/forward buttons
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page) {
        showPage(event.state.page);
    }
});

// Handle direct URL access
window.addEventListener('load', () => {
    const hash = window.location.hash.slice(1);
    if (hash) {
        showPage(hash);
    } else {
        // Default to character list page
        showPage('character-list');
    }
});

// Character card click handler
function viewCharacter(characterId) {
    showPage('character-sheet');
    loadCharacterData(characterId);
}

// Back button handler
function goBack() {
    renderCharacterCards(); // Update character cards with any changes
    showPage('character-list');
}

// Helper function to style editable input elements
function styleEditableInput(input, options = {}) {
    // Set default styles
    input.style.border = '2px solid rgba(255, 255, 255, 0.2)';
    input.style.borderRadius = '6px';
    input.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    input.style.color = 'inherit';
    input.style.fontSize = 'inherit';
    input.style.fontWeight = 'inherit';
    input.style.fontFamily = 'inherit';
    input.style.outline = 'none';
    input.style.transition = 'all 0.2s ease';
    
    // Apply custom options
    if (options.width) input.style.width = options.width;
    if (options.textAlign) input.style.textAlign = options.textAlign;
    if (options.padding) input.style.padding = options.padding;
    if (options.minWidth) input.style.minWidth = options.minWidth;
    
    // Add focus styling
    input.addEventListener('focus', () => {
        input.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        input.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
    });
    
    // Add blur styling
    input.addEventListener('blur', () => {
        input.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        input.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });
}

// HP editing functionality
function editHP(element) {
    const currentValue = element.textContent;
    const characterId = element.dataset.characterId;
    
    // Create input field
    const input = document.createElement('input');
    input.type = 'number';
    input.value = currentValue;
    input.min = '0';
    
    // Apply styling
    styleEditableInput(input, {
        width: '50px',
        textAlign: 'center',
        padding: '2px 4px'
    });
    
    // Replace the span with input
    element.parentNode.replaceChild(input, element);
    input.focus();
    input.select();
    
    // Handle saving the value
    function saveHP() {
        const newValue = parseInt(input.value) || 0;
        const character = characters[characterId];
        
        if (character) {
            // Update the character data
            character.update_combat_skills("hp", newValue);
            
            // Create new span with updated value
            const newSpan = document.createElement('span');
            newSpan.className = 'editable-hp';
            newSpan.dataset.characterId = characterId;
            newSpan.onclick = () => editHP(newSpan);
            newSpan.textContent = newValue;
            
            // Replace input with updated span
            input.parentNode.replaceChild(newSpan, input);
        }
    }
    
    // Save on Enter key or when clicking away
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveHP();
        }
        if (e.key === 'Escape') {
            // Cancel editing - restore original value
            const newSpan = document.createElement('span');
            newSpan.className = 'editable-hp';
            newSpan.dataset.characterId = characterId;
            newSpan.onclick = () => editHP(newSpan);
            newSpan.textContent = currentValue;
            input.parentNode.replaceChild(newSpan, input);
        }
    });
    
    // Save on blur (handled by the helper function for styling)
    input.addEventListener('blur', saveHP);
}

// Name editing functionality
function editName(element) {
    const currentValue = element.textContent;
    const characterId = element.dataset.characterId;
    
    // Create input field
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    
    // Apply styling
    styleEditableInput(input, {
        width: '250px',
        textAlign: 'left',
        padding: '4px 8px',
        minWidth: '200px'
    });
    
    // Replace the span with input
    element.parentNode.replaceChild(input, element);
    input.focus();
    input.select();
    
    // Handle saving the value
    function saveName() {
        const newValue = input.value.trim();
        if (newValue === '') {
            // Don't allow empty names - restore original value
            const newSpan = document.createElement('span');
            newSpan.className = 'editable-name';
            newSpan.dataset.characterId = characterId;
            newSpan.onclick = () => editName(newSpan);
            newSpan.textContent = currentValue;
            input.parentNode.replaceChild(newSpan, input);
            return;
        }
        
        const character = characters[characterId];
        
        if (character) {
            // Update the character data
            // character.update_name(newValue);
            character.update_base("name", newValue);
            
            // Update the avatar with the new first letter
            const avatarElement = document.querySelector('.character-avatar');
            if (avatarElement) {
                avatarElement.textContent = newValue[0].toUpperCase();
            }
            
            // Create new span with updated value
            const newSpan = document.createElement('span');
            newSpan.className = 'editable-name';
            newSpan.dataset.characterId = characterId;
            newSpan.onclick = () => editName(newSpan);
            newSpan.textContent = newValue;
            
            // Replace input with updated span
            input.parentNode.replaceChild(newSpan, input);
            
            // Update the character list if needed (for when they go back)
            renderCharacterCards();
        }
    }
    
    // Save on Enter key or when clicking away
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveName();
        }
        if (e.key === 'Escape') {
            // Cancel editing - restore original value
            const newSpan = document.createElement('span');
            newSpan.className = 'editable-name';
            newSpan.dataset.characterId = characterId;
            newSpan.onclick = () => editName(newSpan);
            newSpan.textContent = currentValue;
            input.parentNode.replaceChild(newSpan, input);
        }
    });
    
    // Save on blur (handled by the helper function for styling)
    input.addEventListener('blur', saveName);
}

// Render character cards using template
function renderCharacterCards() {
    const characterGrid = document.querySelector('.character-grid');
    const template = document.getElementById('character-card-template');
    
    if (!characterGrid || !template) {
        console.log("cannot render characters")
        return;
    }

    // Clear existing cards
    characterGrid.innerHTML = '';

    // Create and populate cards for each character
    Object.values(characters).forEach(character => {
        // Clone the template
        const card = template.content.cloneNode(true);
        
        // Set data attribute for identification
        card.querySelector('.character-card').dataset.characterId = character.id;
        
        // Fill in the character data
        card.querySelector('.character-name').textContent = character.name;
        card.querySelector('.character-level').textContent = `Level ${character.level}`;
        card.querySelector('.character-details').textContent = `${character.race} • ${character.class} • ${character.background}`;
        
        // Fill in stats
        card.querySelector('.hp-value').textContent = `${character.combat_skills.hp}/${character.combat_skills.max_hp}`;
        card.querySelector('.ac-value').textContent = character.combat_skills.ac;

        card.querySelector('.main-stat-label').textContent = 'Speed'
        card.querySelector('.main-stat-value').textContent = character.combat_skills.speed
        
        // Add click handler for the card (view character)
        card.querySelector('.character-card').addEventListener('click', (e) => {
            // Don't trigger if clicking on action buttons
            if (e.target.classList.contains('action-btn')) return;
            viewCharacter(character.id);
        });
        
        // Add click handler for delete button
        card.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click event
            deleteCharacter(character.id);
        });
        
        // Add the card to the grid
        characterGrid.appendChild(card);
    });
}

// Load character data for the character sheet
function loadCharacterData(characterId) {
    const character = characters[characterId];
    if (!character) return;

    // Update character info - make name editable
    const titleElement = document.querySelector('.character-title');
    titleElement.innerHTML = `<span class="editable-name" data-character-id="${character.id}" onclick="editName(this)">${character.name}</span>`;
    document.querySelector('.character-subtitle').textContent = `Level ${character.level} ${character.race} ${character.class}`;
    document.querySelector('.character-avatar').textContent = character.name[0];

    // Update ability scores if they exist
    if (character.abilities) {
        const abilityScores = document.querySelector('.ability-scores');
        abilityScores.innerHTML = Object.entries(character.abilities)
            .map(([ability, value]) => {
                const modifier = Math.floor((value - 10) / 2);
                const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                return `
                    <div class="ability-score">
                        <div class="ability-name">${ability.toUpperCase()}</div>
                        <div class="ability-value">${value}</div>
                        <div class="ability-modifier">${modifierText}</div>
                    </div>
                `;
            }).join('');
    }

    // Update skills if they exist
    if (character.skills) {
        const skillsList = document.querySelector('.skills-list');
        skillsList.innerHTML = Object.entries(character.skills)
            .map(([skillName, abilityScore]) => {
                const modifier = Math.floor((abilityScore - 10) / 2);
                const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                return `
                    <div class="skill-item">
                        <span class="skill-name">${skillName.charAt(0).toUpperCase() + skillName.slice(1)}</span>
                        <span class="skill-modifier">${modifierText}</span>
                    </div>
                `;
            }).join('');
        
        // Clear any existing search
        const skillsSearchBar = document.getElementById('skills-search');
        if (skillsSearchBar) {
            skillsSearchBar.value = '';
        }
    }

    // Update combat stats if they exist
    if (character.combat_skills) {
        const combat_skills = document.querySelector('.combat-stats');
        combat_skills.innerHTML = Object.entries(character.combat_skills)
            .filter(([stat, value]) => stat !== 'max_hp') // Filter out max_hp because it's already bundled in with the hp (eg: {{hp}}/{{max_hp}})
            .map(([stat, value]) => `
                <div class="combat-stat">
                    <div class="combat-stat-value">
                        ${stat === 'hp' ? 
                            `<span class="editable-hp" data-character-id="${character.id}" onclick="editHP(this)">${value}</span>/${character.combat_skills.max_hp}` 
                            : value}
                    </div>
                    <div class="combat-stat-label">${stat === 'hp' ? 'Hit Points' : stat === 'ac' ? 'Armor Class' : stat.charAt(0).toUpperCase() + stat.slice(1)}</div>
                </div>
            `).join('');
    }

    // Update equipment if it exists
    if (character.equipment) {
        const equipmentSection = document.querySelector('.sheet-section:has(.equipment-item)');
        if (equipmentSection) {
            const equipmentList = equipmentSection.querySelector('.equipment-item').parentElement;
            equipmentList.innerHTML = character.equipment
                .map(item => `
                    <div class="equipment-item">
                        <div>
                            <div class="item-name">${item.name}</div>
                            <div class="item-details">${item.details}</div>
                        </div>
                    </div>
                `).join('');
        }
    }

    // Update background if it exists
    const backgroundTextarea = document.querySelector('.textarea-field');
    if (backgroundTextarea) {
        backgroundTextarea.value = character.background || '';
        
        // Add dataset to identify which character this textarea belongs to
        backgroundTextarea.dataset.characterId = character.id;
        
        // Remove existing event listeners to avoid duplicates
        backgroundTextarea.removeEventListener('blur', handleBackgroundSave);
        backgroundTextarea.removeEventListener('input', handleBackgroundInput);
        
        // Add event listeners for saving background changes
        backgroundTextarea.addEventListener('blur', handleBackgroundSave);
        backgroundTextarea.addEventListener('input', handleBackgroundInput);
        
        // Store original value for comparison
        backgroundTextarea.dataset.originalValue = character.background || '';
    }
}

// Background/notes saving functionality
let backgroundSaveTimeout;

function handleBackgroundInput(event) {
    // Clear existing timeout
    if (backgroundSaveTimeout) {
        clearTimeout(backgroundSaveTimeout);
    }
    
    // Set a timeout to save after user stops typing (debounce)
    backgroundSaveTimeout = setTimeout(() => {
        handleBackgroundSave(event);
    }, 2000); // Save after 2 seconds of no input
}

async function handleBackgroundSave(event) {
    const textarea = event.target;
    const characterId = textarea.dataset.characterId;
    const newValue = textarea.value;
    const originalValue = textarea.dataset.originalValue;
    
    // Only save if the value has actually changed
    if (newValue !== originalValue) {
        const character = characters[characterId];
        
        if (character) {
            // Update the character data
            character.update_base("background", newValue);
            
            // Update the stored original value
            textarea.dataset.originalValue = newValue;
            
            console.log('Background saved successfully');
        }
    }
}

// Skills search functionality
function handleSkillsSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach(skillItem => {
        const skillName = skillItem.querySelector('.skill-name');
        const skillText = skillName.textContent.toLowerCase();
        
        // Reset any existing highlighting
        skillName.innerHTML = skillName.textContent;
        
        if (searchTerm === '') {
            // Show all items when search is empty
            skillItem.style.display = 'flex';
            skillItem.style.opacity = '1';
        } else if (skillText.includes(searchTerm)) {
            // Show and highlight matching items
            skillItem.style.display = 'flex';
            skillItem.style.opacity = '1';
            
            // Highlight the matching text
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            const highlightedText = skillName.textContent.replace(regex, '<span style="background-color: rgba(251, 191, 36, 0.3); color: #fbbf24; padding: 1px 2px; border-radius: 2px;">$1</span>');
            skillName.innerHTML = highlightedText;
        } else {
            // Hide non-matching items
            skillItem.style.display = 'flex';
            skillItem.style.opacity = '0.3';
        }
    });
}

// Capture Ctrl+F/Cmd+F to focus skills search
function handleFindKeyShortcut(event) {
    const isCtrlF = (event.ctrlKey || event.metaKey) && event.key === 'f';
    const isOnCharacterSheet = document.getElementById('character-sheet').classList.contains('active');
    
    if (isCtrlF && isOnCharacterSheet) {
        event.preventDefault(); // Prevent browser's default find dialog
        
        const skillsSearchBar = document.getElementById('skills-search');
        if (skillsSearchBar) {
            skillsSearchBar.focus();
            skillsSearchBar.select(); // Select all text in the search bar
        }
    }
}

// Dropdown functionality
let dropdownActive = false;

function toggleCreateDropdown() {
    const button = document.getElementById('create-button');
    const dropdown = document.getElementById('create-dropdown');
    
    dropdownActive = !dropdownActive;
    
    if (dropdownActive) {
        button.classList.add('active');
        dropdown.classList.add('active');
    } else {
        button.classList.remove('active');
        dropdown.classList.remove('active');
    }
}

function closeDropdown() {
    const button = document.getElementById('create-button');
    const dropdown = document.getElementById('create-dropdown');
    
    dropdownActive = false;
    button.classList.remove('active');
    dropdown.classList.remove('active');
}

// Random character generation
function generateRandomCharacter() {
    // Request the server to create a random character
    fetch('http://localhost:8080/characters', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            "mode": "create_random"
        })
    })
    .then(response => {
        if (response.ok) {
            // If successful, fetch the updated character list
            return fetch("http://localhost:8080/characters");
        } else {
            throw new Error('Failed to create random character');
        }
    })
    .then(response => response.json())
    .then(data => {
        // Update the characters map with fresh data from server
        characters = {};
        Object.values(data).forEach(characterData => {
            const character = Character.from_json(JSON.stringify(characterData));
            characters[character.id] = character;
        });
        console.log('Characters refreshed after random creation:', characters);
        // Re-render character cards
        renderCharacterCards();
        // Close dropdown
        closeDropdown();
    })
    .catch(error => {
        console.error('Error creating random character:', error);
        // Close dropdown even on error
        closeDropdown();
    });
}

// Delete character functionality
function deleteCharacter(characterId) {
    // Confirm deletion with user
    const character = characters[characterId];
    if (!character) return;
    
    const confirmDelete = confirm(`Are you sure you want to delete ${character.name}? This action cannot be undone.`);
    if (!confirmDelete) return;
    
    // Send delete request to server
    fetch('http://localhost:8080/characters', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            "mode": "delete",
            "character_id": characterId
        })
    })
    .then(response => {
        if (response.ok) {
            // If successful, fetch the updated character list
            return fetch("http://localhost:8080/characters");
        } else {
            throw new Error('Failed to delete character');
        }
    })
    .then(response => response.json())
    .then(data => {
        // Update the characters map with fresh data from server
        characters = {};
        Object.values(data).forEach(characterData => {
            const character = Character.from_json(JSON.stringify(characterData));
            characters[character.id] = character;
        });
        console.log('Characters refreshed after deletion:', characters);
        // Re-render character cards
        renderCharacterCards();
    })
    .catch(error => {
        console.error('Error deleting character:', error);
        alert('Failed to delete character. Please try again.');
    });
}

function createCharacterOnServer(character) {
    fetch('http://localhost:8080/characters', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            "mode": "create", 
            "content": character 
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Character created:', data);
        // Add the new character to our local map
        const newCharacter = Character.from_json(JSON.stringify(data));
        characters[newCharacter.id] = newCharacter;
        // Re-render character cards
        renderCharacterCards();
        // Close dropdown
        closeDropdown();
    })
    .catch(error => {
        console.error('Error creating character:', error);
    });
}

// File import functionality
let selectedFile = null;

function showFileImportModal() {
    const modal = document.getElementById('file-import-modal');
    modal.classList.add('active');
}

function hideFileImportModal() {
    const modal = document.getElementById('file-import-modal');
    modal.classList.remove('active');
    selectedFile = null;
    
    // Reset file input
    const fileInput = document.getElementById('file-input');
    fileInput.value = '';
    
    // Disable import button
    const importButton = document.getElementById('import-selected');
    importButton.disabled = true;
}

function handleFileSelection(event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
        selectedFile = file;
        
        // Update UI to show selected file
        const fileList = document.getElementById('file-list');
        fileList.innerHTML = `
            <div class="file-item selected">
                <span class="file-icon">📄</span>
                <span class="file-name">${file.name}</span>
            </div>
        `;
        
        // Enable import button
        const importButton = document.getElementById('import-selected');
        importButton.disabled = false;
    }
}

function importCharacterFromFile() {
    if (!selectedFile) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const characterData = JSON.parse(e.target.result);
            const character = new Character(characterData);
            
            // Send to server
            createCharacterOnServer(character);
            
            // Close modal
            hideFileImportModal();
        } catch (error) {
            console.error('Error parsing character file:', error);
            alert('Error: Invalid character file format');
        }
    };
    reader.readAsText(selectedFile);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetch("http://localhost:8080/characters")
        .then(response => {
            return response.json();
        })
        .then(data => { 
            characters = {};
            Object.values(data).forEach(characterData => {
                const character = Character.from_json(JSON.stringify(characterData));
                characters[character.id] = character;
            });
            renderCharacterCards();
         })
        .catch(error => {
            console.log('Error: ', error);
            console.log('Fetch failed - renderCharacterCards will not be called');
        })

    // Add click handler to back button
    const backButton = document.querySelector('.back-btn');
    if (backButton) {
        backButton.addEventListener('click', goBack);
    }

    // Add skills search functionality
    const skillsSearchBar = document.getElementById('skills-search');
    if (skillsSearchBar) {
        skillsSearchBar.addEventListener('input', handleSkillsSearch);
    }

    // Add keyboard shortcut handler for Ctrl+F/Cmd+F
    document.addEventListener('keydown', handleFindKeyShortcut);
    
    // Add create button functionality
    const createButton = document.getElementById('create-button');
    if (createButton) {
        createButton.addEventListener('click', toggleCreateDropdown);
    }
    
    // Add dropdown option handlers
    const createRandomOption = document.getElementById('create-random');
    if (createRandomOption) {
        createRandomOption.addEventListener('click', () => {
            generateRandomCharacter();
        });
    }
    
    const importCharacterOption = document.getElementById('import-character');
    if (importCharacterOption) {
        importCharacterOption.addEventListener('click', () => {
            closeDropdown();
            showFileImportModal();
        });
    }
    
    // Add file import modal handlers
    const closeFileModal = document.getElementById('close-file-modal');
    if (closeFileModal) {
        closeFileModal.addEventListener('click', hideFileImportModal);
    }
    
    const browseFilesButton = document.getElementById('browse-files');
    if (browseFilesButton) {
        browseFilesButton.addEventListener('click', () => {
            document.getElementById('file-input').click();
        });
    }
    
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelection);
    }
    
    const importSelectedButton = document.getElementById('import-selected');
    if (importSelectedButton) {
        importSelectedButton.addEventListener('click', importCharacterFromFile);
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        const createContainer = document.querySelector('.create-container');
        if (createContainer && !createContainer.contains(event.target) && dropdownActive) {
            closeDropdown();
        }
    });
    
    // Close modal when clicking outside
    const fileModal = document.getElementById('file-import-modal');
    if (fileModal) {
        fileModal.addEventListener('click', (event) => {
            if (event.target === fileModal) {
                hideFileImportModal();
            }
        });
    }
});
