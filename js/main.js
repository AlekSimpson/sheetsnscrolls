var characters = []

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
    showPage('character-list');
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
    input.style.width = '50px';
    input.style.textAlign = 'center';
    input.style.border = '2px solid rgba(255, 255, 255, 0.2)';
    input.style.borderRadius = '6px';
    input.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    input.style.color = 'inherit';
    input.style.fontSize = 'inherit';
    input.style.fontWeight = 'inherit';
    input.style.fontFamily = 'inherit';
    input.style.padding = '2px 4px';
    input.style.outline = 'none';
    input.style.transition = 'all 0.2s ease';
    
    // Add focus styling
    input.addEventListener('focus', () => {
        input.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        input.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
    });
    
    // Replace the span with input
    element.parentNode.replaceChild(input, element);
    input.focus();
    input.select();
    
    // Handle saving the value
    function saveHP() {
        const newValue = parseInt(input.value) || 0;
        const character = characters.find(c => c.id == characterId);
        
        if (character) {
            // Update the character data
            character.combat_skills.hp = newValue;
            
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
    
    // Combined blur handler for both styling and saving
    input.addEventListener('blur', () => {
        // Reset styling
        input.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        input.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        // Save the value
        saveHP();
    });
}

// Name editing functionality
function editName(element) {
    const currentValue = element.textContent;
    const characterId = element.dataset.characterId;
    
    // Create input field
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    input.style.width = '250px';
    input.style.textAlign = 'left';
    input.style.border = '2px solid rgba(255, 255, 255, 0.2)';
    input.style.borderRadius = '6px';
    input.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    input.style.color = 'inherit';
    input.style.fontSize = 'inherit';
    input.style.fontWeight = 'inherit';
    input.style.fontFamily = 'inherit';
    input.style.padding = '4px 8px';
    input.style.outline = 'none';
    input.style.transition = 'all 0.2s ease';
    input.style.minWidth = '200px';
    
    // Add focus styling
    input.addEventListener('focus', () => {
        input.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        input.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
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
        
        const character = characters.find(c => c.id == characterId);
        
        if (character) {
            // Update the character data
            character.name = newValue;
            
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
    
    // Combined blur handler for both styling and saving
    input.addEventListener('blur', () => {
        // Reset styling
        input.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        input.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        // Save the value
        saveName();
    });
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
    characters.forEach(character => {
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
        
        // Add click handler
        card.querySelector('.character-card').addEventListener('click', () => {
            viewCharacter(character.id);
        });
        
        // Add the card to the grid
        characterGrid.appendChild(card);
    });
}

// Load character data for the character sheet
function loadCharacterData(characterId) {
    const character = characters.find(c => c.id === characterId);
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
            .map(([stat, value]) => `
                <div class="combat-stat">
                    <div class="combat-stat-value">
                        ${stat === 'hp' ? 
                            `<span class="editable-hp" data-character-id="${character.id}" onclick="editHP(this)">${value}</span>/${character.combat_skills.max_hp}` 
                            : value}
                    </div>
                    <div class="combat-stat-label">${stat === 'hp' ? 'Hit Points' : stat === 'ac' ? 'Armor Class' : 'Speed'}</div>
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
    if (character.background) {
        const backgroundTextarea = document.querySelector('.textarea-field');
        if (backgroundTextarea) {
            backgroundTextarea.value = character.background;
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

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetch("https://localhost:8080/characters")
        .then(response => {
            return response.json();
        })
        .then(data => { 
            characters = data
            console.log(characters)
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
});
