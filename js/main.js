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
        card.querySelector('.character-details').textContent = 
            `${character.race} • ${character.class} • ${character.background}`;
        
        // Fill in stats
        card.querySelector('.hp-value').textContent = 
            `${character.stats.hp.current}/${character.stats.hp.max}`;
        card.querySelector('.ac-value').textContent = character.stats.ac;
        
        // Find and set the main stat (the one that's not HP or AC)
        const mainStat = Object.keys(character.stats).find(key => key !== 'hp' && key !== 'ac');
        card.querySelector('.main-stat-label').textContent = mainStat.toUpperCase();
        card.querySelector('.main-stat-value').textContent = character.stats[mainStat];
        
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

    // Update character info
    document.querySelector('.character-title').textContent = character.name;
    document.querySelector('.character-subtitle').textContent = 
        `Level ${character.level} ${character.race} ${character.class}`;
    document.querySelector('.character-avatar').textContent = character.name[0];

    // Update ability scores if they exist
    if (character.abilityScores) {
        const abilityScores = document.querySelector('.ability-scores');
        abilityScores.innerHTML = Object.entries(character.abilityScores)
            .map(([ability, data]) => `
                <div class="ability-score">
                    <div class="ability-name">${ability.toUpperCase()}</div>
                    <div class="ability-value">${data.value}</div>
                    <div class="ability-modifier">${data.modifier}</div>
                </div>
            `).join('');
    }

    // Update skills if they exist
    if (character.skills) {
        const skillsList = document.querySelector('.skills-list');
        skillsList.innerHTML = character.skills
            .map(skill => `
                <div class="skill-item">
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-modifier">${skill.modifier}</span>
                </div>
            `).join('');
    }

    // Update combat stats if they exist
    if (character.combatStats) {
        const combatStats = document.querySelector('.combat-stats');
        combatStats.innerHTML = Object.entries(character.combatStats)
            .map(([stat, value]) => `
                <div class="combat-stat">
                    <div class="combat-stat-value">${value}</div>
                    <div class="combat-stat-label">${stat === 'hp' ? 'Hit Points' : 
                        stat === 'ac' ? 'Armor Class' : 'Speed'}</div>
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

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Render character cards
    renderCharacterCards();

    // Add click handler to back button
    const backButton = document.querySelector('.back-btn');
    if (backButton) {
        backButton.addEventListener('click', goBack);
    }
});
