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

    // Clear character search bar
    const characterSearchBar = document.querySelector('.search-bar');
    if (characterSearchBar) {
        characterSearchBar.value = '';
    }

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
        console.log('Equipment data found:', character.equipment);
        console.log('Equipment array length:', character.equipment.length);
        console.log('Equipment array type:', typeof character.equipment);
        console.log('Is equipment an array?', Array.isArray(character.equipment));
        
        if (Array.isArray(character.equipment) && character.equipment.length > 0) {
            console.log('First equipment item:', character.equipment[0]);
            console.log('First equipment item keys:', Object.keys(character.equipment[0]));
        }
        
        const equipmentList = document.querySelector('.equipment-list');
        console.log('Equipment list element:', equipmentList);
        if (equipmentList) {
            const equipmentHTML = character.equipment
                .map((item, idx) => {
                    return `
                        <div class="equipment-item modern" data-item-idx="${idx}">
                            <div class="item-amount-badge-absolute">${item.amount}</div>
                            <button class="item-edit-btn" onclick="editEquipmentItem(${character.id}, ${idx})" title="Edit item">
                                <span class="edit-icon">✏️</span>
                            </button>
                            <div class="equipment-main-row">
                                <div class="item-icon-box">
                                    <span class="item-icon">🗡️</span>
                                </div>
                                <div class="item-main-content">
                                    <div class="item-title-row">
                                        <span class="item-name">${item.name}</span>
                                    </div>
                                    <div class="item-description">${item.description || ''}</div>
                                    <div class="item-tags">
                                        ${item.damage ? `<span class="item-tag dmg-tag">DMG ${item.damage}</span>` : ''}
                                        ${item.notes ? `<span class="item-tag fire-tag">${item.notes}</span>` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            console.log('Generated equipment HTML:', equipmentHTML);
            equipmentList.innerHTML = equipmentHTML;
        }
    } else {
        console.log('No equipment data found for character:', character);
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

// Character search functionality
function handleCharacterSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const characterGrid = document.querySelector('.character-grid');
    
    if (!characterGrid) return;
    
    // Remove any existing no-results message
    const existingNoResults = document.querySelector('.no-results-message');
    if (existingNoResults) {
        existingNoResults.remove();
    }
    
    if (searchTerm === '') {
        // If search is empty, restore original order and show all characters
        renderCharacterCards();
        return;
    }
    
    // Calculate relevance scores for each character
    const scoredCharacters = Object.values(characters).map(character => {
        const score = calculateSearchScore(character, searchTerm);
        return { character, score };
    });
    
    // Sort by score (highest first), then by name for ties
    scoredCharacters.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return a.character.name.localeCompare(b.character.name);
    });
    
    // Clear the grid
    characterGrid.innerHTML = '';
    
    // Check if we have any matches
    const hasMatches = scoredCharacters.some(item => item.score > 0);
    
    if (!hasMatches) {
        // Show no results message
        const noResultsMessage = document.createElement('div');
        noResultsMessage.className = 'no-results-message';
        noResultsMessage.style.cssText = `
            grid-column: 1 / -1;
            text-align: center;
            padding: 40px 20px;
            color: #94a3b8;
            font-size: 16px;
            font-style: italic;
        `;
        noResultsMessage.textContent = `No characters found matching "${event.target.value}"`;
        characterGrid.appendChild(noResultsMessage);
        return;
    }
    
    // Re-render cards in sorted order
    const template = document.getElementById('character-card-template');
    if (!template) return;
    
    scoredCharacters.forEach(({ character, score }) => {
        // Clone the template
        const card = template.content.cloneNode(true);
        
        // Set data attribute for identification
        card.querySelector('.character-card').dataset.characterId = character.id;
        
        // Fill in the character data with highlighting
        const nameElement = card.querySelector('.character-name');
        nameElement.innerHTML = highlightSearchTerm(character.name, searchTerm);
        
        card.querySelector('.character-level').textContent = `Level ${character.level}`;
        
        // Highlight matches in details
        const detailsText = `${character.race} • ${character.class} • ${character.background}`;
        card.querySelector('.character-details').innerHTML = highlightSearchTerm(detailsText, searchTerm);
        
        // Fill in stats
        card.querySelector('.hp-value').textContent = `${character.combat_skills.hp}/${character.combat_skills.max_hp}`;
        card.querySelector('.ac-value').textContent = character.combat_skills.ac;
        card.querySelector('.main-stat-label').textContent = 'Speed';
        card.querySelector('.main-stat-value').textContent = character.combat_skills.speed;
        
        // Apply visual feedback based on score
        const cardElement = card.querySelector('.character-card');
        if (score === 0) {
            // Low relevance - fade out
            cardElement.style.opacity = '0.3';
            cardElement.style.transform = 'scale(0.95)';
        } else if (score >= 100) {
            // High relevance - highlight
            cardElement.style.opacity = '1';
            cardElement.style.transform = 'scale(1)';
            cardElement.style.boxShadow = '0 0 0 2px rgba(251, 191, 36, 0.3)';
        } else {
            // Medium relevance - normal
            cardElement.style.opacity = '1';
            cardElement.style.transform = 'scale(1)';
        }
        
        // Add click handler for the card (view character)
        cardElement.addEventListener('click', (e) => {
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

// Calculate search relevance score for a character
function calculateSearchScore(character, searchTerm) {
    let score = 0;
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    // Name scoring (highest weight)
    const name = character.name.toLowerCase();
    if (name === lowerSearchTerm) {
        score += 1000; // Exact match
    } else if (name.startsWith(lowerSearchTerm)) {
        score += 500; // Starts with search term
    } else if (name.includes(lowerSearchTerm)) {
        score += 200; // Contains search term
        // Bonus for earlier position in name
        const position = name.indexOf(lowerSearchTerm);
        score += Math.max(0, 50 - position * 5);
    }
    
    // Class scoring (high weight)
    const characterClass = character.class.toLowerCase();
    if (characterClass === lowerSearchTerm) {
        score += 300;
    } else if (characterClass.startsWith(lowerSearchTerm)) {
        score += 150;
    } else if (characterClass.includes(lowerSearchTerm)) {
        score += 75;
    }
    
    // Race scoring (medium weight)
    const race = character.race.toLowerCase();
    if (race === lowerSearchTerm) {
        score += 200;
    } else if (race.startsWith(lowerSearchTerm)) {
        score += 100;
    } else if (race.includes(lowerSearchTerm)) {
        score += 50;
    }
    
    // Background scoring (lower weight)
    const background = character.background.toLowerCase();
    if (background === lowerSearchTerm) {
        score += 100;
    } else if (background.startsWith(lowerSearchTerm)) {
        score += 50;
    } else if (background.includes(lowerSearchTerm)) {
        score += 25;
    }
    
    // Level scoring (special case)
    const levelString = `level ${character.level}`;
    const levelMatch = levelString.includes(lowerSearchTerm) || 
                      character.level.toString().includes(lowerSearchTerm);
    if (levelMatch) {
        score += 75;
    }
    
    return score;
}

// Highlight search term in text
function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span style="background-color: rgba(251, 191, 36, 0.3); color: #fbbf24; padding: 1px 2px; border-radius: 2px;">$1</span>');
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

// Equipment modal functionality
let currentCharacterId = null;

function showAddEquipmentModal() {
    // Get the current character ID from the character sheet
    const characterTitle = document.querySelector('.character-title .editable-name');
    if (characterTitle) {
        currentCharacterId = characterTitle.dataset.characterId;
    }
    
    if (currentCharacterId === null || currentCharacterId === undefined) {
        console.error('No character selected');
        return;
    }
    
    const modal = document.getElementById('add-equipment-modal');
    modal.classList.add('active');
    
    // Clear form fields
    document.getElementById('equipment-name').value = '';
    document.getElementById('equipment-description').value = '';
    document.getElementById('equipment-range').value = '';
    document.getElementById('equipment-hitdie-bonus').value = '';
    document.getElementById('equipment-amount').value = '';
    document.getElementById('equipment-damage').value = '';
    document.getElementById('equipment-notes').value = '';
    
    // Focus on the name field
    document.getElementById('equipment-name').focus();
}

function hideAddEquipmentModal() {
    console.log('hideAddEquipmentModal called');
    
    const modal = document.getElementById('add-equipment-modal');
    modal.classList.remove('active');
    
    // Reset modal state
    const modalTitle = modal.querySelector('.modal-header h2');
    const addButton = document.getElementById('add-equipment');
    
    // Reset title and button text
    modalTitle.textContent = 'Add Equipment';
    addButton.textContent = 'Add Item';
    
    // Clear editing state
    window.currentEditingItemIndex = undefined;
    currentCharacterId = null;
    console.log('Reset currentCharacterId to null');
}

function addEquipmentItem() {
    console.log('addEquipmentItem called');
    console.log('currentCharacterId:', currentCharacterId);
    console.log('window.currentEditingItemIndex:', window.currentEditingItemIndex);
    
    const nameInput = document.getElementById('equipment-name');
    const descriptionInput = document.getElementById('equipment-description');
    const rangeInput = document.getElementById('equipment-range');
    const hitdieBonusInput = document.getElementById('equipment-hitdie-bonus');
    const amountInput = document.getElementById('equipment-amount');
    const damageInput = document.getElementById('equipment-damage');
    const notesInput = document.getElementById('equipment-notes');
    
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    const range = parseInt(rangeInput.value) || 0;
    const hitdieBonus = parseInt(hitdieBonusInput.value) || 0;
    const amount = parseInt(amountInput.value);
    // Allow 0 amounts, but default to 1 if empty or invalid, and prevent negative amounts
    const finalAmount = isNaN(amount) ? 1 : Math.max(0, amount);
    const damage = damageInput.value.trim();
    const notes = notesInput.value.trim();
    
    if (!name) {
        alert('Please enter an item name');
        return;
    }
    
    if (currentCharacterId === null || currentCharacterId === undefined) {
        console.error('No character selected');
        return;
    }
    
    const equipmentData = {
        name: name,
        range: range,
        hitdie_bonus: hitdieBonus,
        amount: finalAmount,
        description: description,
        damage: damage,
        notes: notes
    };
    
    // Check if we're editing an existing item
    const isEditing = window.currentEditingItemIndex !== undefined;
    
    const requestBody = {
        mode: isEditing ? 'item_update' : 'item_add',
        character_id: parseInt(currentCharacterId),
        item: equipmentData
    };
    
    // Add item index for updates
    if (isEditing) {
        requestBody.item_index = window.currentEditingItemIndex;
    }
    
    console.log('Sending equipment data to server:', requestBody);
    
    // Send request to server
    fetch('http://localhost:8080/characters', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => {
        console.log('Server response status:', response.status);
        if (response.ok) {
            // If successful, fetch the updated character list
            return fetch("http://localhost:8080/characters");
        } else {
            throw new Error(`Failed to ${isEditing ? 'update' : 'add'} equipment item`);
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Updated character data from server:', data);
        // Update the characters map with fresh data from server
        characters = {};
        Object.values(data).forEach(characterData => {
            const character = Character.from_json(JSON.stringify(characterData));
            characters[character.id] = character;
        });
        
        console.log('Updated characters map:', characters);
        
        // Save the current character ID before closing modal (which resets it)
        const characterIdToReload = currentCharacterId;
        
        // Close modal
        hideAddEquipmentModal();
        
        // Reload the current character data to show the updated equipment
        loadCharacterData(characterIdToReload);
        
        console.log(`Equipment item ${isEditing ? 'updated' : 'added'} successfully`);
    })
    .catch(error => {
        console.error(`Error ${isEditing ? 'updating' : 'adding'} equipment item:`, error);
        alert(`Failed to ${isEditing ? 'update' : 'add'} equipment item. Please try again.`);
    });
}

function editEquipmentItem(characterId, itemIndex) {
    console.log('editEquipmentItem called with characterId:', characterId);
    
    const character = characters[characterId];
    if (!character || !character.equipment || !character.equipment[itemIndex]) {
        console.error('Character or equipment item not found');
        return;
    }
    
    const item = character.equipment[itemIndex];
    
    // Set the current character ID for the modal
    currentCharacterId = characterId;
    console.log('Set currentCharacterId to:', currentCharacterId);
    
    // Store the item index being edited
    window.currentEditingItemIndex = itemIndex;
    
    const modal = document.getElementById('add-equipment-modal');
    const modalTitle = modal.querySelector('.modal-header h2');
    const addButton = document.getElementById('add-equipment');
    
    // Update modal title and button text
    modalTitle.textContent = 'Edit Equipment';
    addButton.textContent = 'Update Item';
    
    // Populate form fields with existing item data
    document.getElementById('equipment-name').value = item.name || '';
    document.getElementById('equipment-description').value = item.description || '';
    document.getElementById('equipment-range').value = item.range || '';
    document.getElementById('equipment-hitdie-bonus').value = item.hitdie_bonus || '';
    document.getElementById('equipment-amount').value = item.amount !== undefined ? item.amount : 1;
    document.getElementById('equipment-damage').value = item.damage || '';
    document.getElementById('equipment-notes').value = item.notes || '';
    
    // Show the modal
    modal.classList.add('active');
    
    // Focus on the name field
    document.getElementById('equipment-name').focus();
}

// Character edit modal functionality
let currentEditingCharacterId = null;

// Function to calculate D&D ability modifier
function calculateAbilityModifier(abilityScore) {
    return Math.floor((abilityScore - 10) / 2);
}

// Function to update ability modifier displays
function updateAbilityModifiers() {
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    const modifierIds = ['str-modifier', 'dex-modifier', 'con-modifier', 'int-modifier', 'wis-modifier', 'cha-modifier'];
    
    abilities.forEach((ability, index) => {
        const input = document.getElementById(`edit-${ability}`);
        const modifierElement = document.getElementById(modifierIds[index]);
        
        if (input && modifierElement) {
            const score = parseInt(input.value) || 10;
            const modifier = calculateAbilityModifier(score);
            modifierElement.textContent = modifier >= 0 ? `+${modifier}` : `${modifier}`;
        }
    });
}

function showCharacterEditModal() {
    // Get the current character ID from the character sheet
    const characterTitle = document.querySelector('.character-title .editable-name');
    if (characterTitle) {
        currentEditingCharacterId = characterTitle.dataset.characterId;
    }
    
    if (currentEditingCharacterId === null || currentEditingCharacterId === undefined) {
        console.error('No character selected');
        return;
    }
    
    const character = characters[currentEditingCharacterId];
    if (!character) {
        console.error('Character not found');
        return;
    }
    
    const modal = document.getElementById('character-edit-modal');
    modal.classList.add('active');
    
    // Populate form fields with current character data
    document.getElementById('edit-character-name').value = character.name;
    document.getElementById('edit-character-level').value = character.level;
    document.getElementById('edit-character-race').value = character.race;
    document.getElementById('edit-character-class').value = character.class;
    
    // Populate ability scores
    document.getElementById('edit-strength').value = character.abilities.strength;
    document.getElementById('edit-dexterity').value = character.abilities.dexterity;
    document.getElementById('edit-constitution').value = character.abilities.constitution;
    document.getElementById('edit-intelligence').value = character.abilities.intelligence;
    document.getElementById('edit-wisdom').value = character.abilities.wisdom;
    document.getElementById('edit-charisma').value = character.abilities.charisma;
    
    // Populate combat stats
    document.getElementById('edit-max-hp').value = character.combat_skills.max_hp;
    document.getElementById('edit-ac').value = character.combat_skills.ac;
    document.getElementById('edit-speed').value = character.combat_skills.speed;
    
    // Update ability modifiers
    updateAbilityModifiers();
    
    // Focus on the name field
    document.getElementById('edit-character-name').focus();
}

function hideCharacterEditModal() {
    const modal = document.getElementById('character-edit-modal');
    modal.classList.remove('active');
    currentEditingCharacterId = null;
}

function rerollAbilityScores() {
    if (!currentEditingCharacterId) return;
    
    // Send request to server to reroll abilities
    fetch('http://localhost:8080/characters', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            "mode": "reroll_abilities",
            "character_id": parseInt(currentEditingCharacterId)
        })
    })
    .then(response => {
        if (response.ok) {
            return fetch("http://localhost:8080/characters");
        } else {
            throw new Error('Failed to reroll abilities');
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
        
        // Reload the current character data to show the updated abilities
        loadCharacterData(currentEditingCharacterId);
        
        // Update the ability score input fields with new values
        const updatedCharacter = characters[currentEditingCharacterId];
        if (updatedCharacter) {
            document.getElementById('edit-strength').value = updatedCharacter.abilities.strength;
            document.getElementById('edit-dexterity').value = updatedCharacter.abilities.dexterity;
            document.getElementById('edit-constitution').value = updatedCharacter.abilities.constitution;
            document.getElementById('edit-intelligence').value = updatedCharacter.abilities.intelligence;
            document.getElementById('edit-wisdom').value = updatedCharacter.abilities.wisdom;
            document.getElementById('edit-charisma').value = updatedCharacter.abilities.charisma;
            
            // Update ability modifiers after reroll
            updateAbilityModifiers();
        }
        
        console.log('Ability scores rerolled successfully');
        alert('Ability scores have been rerolled!');
    })
    .catch(error => {
        console.error('Error rerolling abilities:', error);
        alert('Failed to reroll ability scores. Please try again.');
    });
}





function saveCharacterEdit() {
    if (!currentEditingCharacterId) return;
    
    const character = characters[currentEditingCharacterId];
    if (!character) return;
    
    // Get values from form
    const newName = document.getElementById('edit-character-name').value.trim();
    const newLevel = parseInt(document.getElementById('edit-character-level').value) || 1;
    const newRace = document.getElementById('edit-character-race').value.trim();
    const newClass = document.getElementById('edit-character-class').value.trim();
    
    // Get ability score values
    const newStrength = parseInt(document.getElementById('edit-strength').value) || 10;
    const newDexterity = parseInt(document.getElementById('edit-dexterity').value) || 10;
    const newConstitution = parseInt(document.getElementById('edit-constitution').value) || 10;
    const newIntelligence = parseInt(document.getElementById('edit-intelligence').value) || 10;
    const newWisdom = parseInt(document.getElementById('edit-wisdom').value) || 10;
    const newCharisma = parseInt(document.getElementById('edit-charisma').value) || 10;
    
    // Get combat stats values
    const newMaxHP = parseInt(document.getElementById('edit-max-hp').value) || 1;
    const newAC = parseInt(document.getElementById('edit-ac').value) || 10;
    const newSpeed = parseInt(document.getElementById('edit-speed').value) || 30;
    
    // Validate required fields
    if (!newName) {
        alert('Character name is required');
        return;
    }
    
    // Validate ability scores (1-30 range)
    const abilityScores = [newStrength, newDexterity, newConstitution, newIntelligence, newWisdom, newCharisma];
    for (let score of abilityScores) {
        if (score < 1 || score > 30) {
            alert('Ability scores must be between 1 and 30');
            return;
        }
    }
    
    // Validate max HP (1-999 range)
    if (newMaxHP < 1 || newMaxHP > 999) {
        alert('Max HP must be between 1 and 999');
        return;
    }
    
    // Validate AC (1-30 range)
    if (newAC < 1 || newAC > 30) {
        alert('AC must be between 1 and 30');
        return;
    }
    
    // Validate Speed (0-120 range)
    if (newSpeed < 0 || newSpeed > 120) {
        alert('Walking Speed must be between 0 and 120');
        return;
    }
    
    // Update character properties locally first
    character.name = newName;
    character.level = newLevel;
    character.race = newRace;
    character.class = newClass;
    character.abilities.strength = newStrength;
    character.abilities.dexterity = newDexterity;
    character.abilities.constitution = newConstitution;
    character.abilities.intelligence = newIntelligence;
    character.abilities.wisdom = newWisdom;
    character.abilities.charisma = newCharisma;
    character.combat_skills.max_hp = newMaxHP;
    character.combat_skills.ac = newAC;
    character.combat_skills.speed = newSpeed;
    
    // Send update to server and wait for response
    fetch('http://localhost:8080/characters', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            "mode": "update", 
            "content": character.clone()
        })
    })
    .then(response => {
        if (response.ok) {
            return fetch("http://localhost:8080/characters");
        } else {
            throw new Error('Failed to update character');
        }
    })
    .then(response => response.json())
    .then(data => {
        // Update the characters map with fresh data from server
        characters = {};
        Object.values(data).forEach(characterData => {
            const char = Character.from_json(JSON.stringify(characterData));
            characters[char.id] = char;
        });
        
        // Save the character ID before closing modal (since hideCharacterEditModal sets it to null)
        const characterIdToReload = currentEditingCharacterId;
        
        // Close modal
        hideCharacterEditModal();
        
        // Reload character data to reflect changes (using saved ID)
        loadCharacterData(characterIdToReload);
        
        // Re-render character cards to update the character list
        renderCharacterCards();
        
        console.log('Character updated successfully');
    })
    .catch(error => {
        console.error('Error updating character:', error);
        alert('Failed to update character. Please try again.');
    });
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

    // Add character search functionality
    const characterSearchBar = document.querySelector('.search-bar');
    if (characterSearchBar) {
        characterSearchBar.addEventListener('input', handleCharacterSearch);
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
    
    // Add new equipment button functionality
    const newEquipmentBtn = document.getElementById('new-equipment-btn');
    if (newEquipmentBtn) {
        newEquipmentBtn.addEventListener('click', showAddEquipmentModal);
    }
    
    // Add equipment modal handlers
    const closeEquipmentModal = document.getElementById('close-equipment-modal');
    if (closeEquipmentModal) {
        closeEquipmentModal.addEventListener('click', hideAddEquipmentModal);
    }
    
    const cancelEquipmentBtn = document.getElementById('cancel-equipment');
    if (cancelEquipmentBtn) {
        cancelEquipmentBtn.addEventListener('click', hideAddEquipmentModal);
    }
    
    const addEquipmentBtn = document.getElementById('add-equipment');
    if (addEquipmentBtn) {
        addEquipmentBtn.addEventListener('click', addEquipmentItem);
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

    // Close equipment modal when clicking outside
    const equipmentModal = document.getElementById('add-equipment-modal');
    if (equipmentModal) {
        equipmentModal.addEventListener('click', (event) => {
            if (event.target === equipmentModal) {
                hideAddEquipmentModal();
            }
        });
    }
    
    // Add character edit button functionality
    const editCharacterBtn = document.getElementById('edit-character-btn');
    if (editCharacterBtn) {
        editCharacterBtn.addEventListener('click', showCharacterEditModal);
    }
    
    // Add character edit modal handlers
    const closeCharacterEditModal = document.getElementById('close-character-edit-modal');
    if (closeCharacterEditModal) {
        closeCharacterEditModal.addEventListener('click', hideCharacterEditModal);
    }
    
    const cancelCharacterEdit = document.getElementById('cancel-character-edit');
    if (cancelCharacterEdit) {
        cancelCharacterEdit.addEventListener('click', hideCharacterEditModal);
    }
    
    const saveCharacterEditBtn = document.getElementById('save-character-edit');
    if (saveCharacterEditBtn) {
        saveCharacterEditBtn.addEventListener('click', saveCharacterEdit);
    }
    
    // Add character edit action handlers
    const rerollAbilitiesBtn = document.getElementById('reroll-abilities');
    if (rerollAbilitiesBtn) {
        rerollAbilitiesBtn.addEventListener('click', rerollAbilityScores);
    }
    

    

    
    // Close character edit modal when clicking outside
    const characterEditModal = document.getElementById('character-edit-modal');
    if (characterEditModal) {
        characterEditModal.addEventListener('click', (event) => {
            if (event.target === characterEditModal) {
                hideCharacterEditModal();
            }
        });
    }
    
    // Add event listeners to ability score inputs for real-time modifier updates
    const abilityInputs = ['edit-strength', 'edit-dexterity', 'edit-constitution', 'edit-intelligence', 'edit-wisdom', 'edit-charisma'];
    abilityInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', updateAbilityModifiers);
        }
    });
});
