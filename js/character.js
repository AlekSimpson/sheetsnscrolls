class Character {
    constructor(data = {}) {
        this.id = data.id || 0;
        this.name = data.name || "";
        this.level = data.level || 1;
        this.class = data.class || "";
        this.hitdice = data.hitdice || 0;
        this.race = data.race || "";
        
        this.abilities = {
            strength: data.abilities?.strength || 0,
            dexterity: data.abilities?.dexterity || 0,
            constitution: data.abilities?.constitution || 0,
            intelligence: data.abilities?.intelligence || 0,
            wisdom: data.abilities?.wisdom || 0,
            charisma: data.abilities?.charisma || 0
        };
        
        this.combat_skills = {
            hp: data.combat_skills?.hp || 0,
            max_hp: data.combat_skills?.max_hp || 0,
            ac: data.combat_skills?.ac || 0,
            speed: data.combat_skills?.speed || 30
        };
        
        this.equipment = data.equipment || [];
        
        this.skills = {
            acrobatics: data.skills?.acrobatics || 0,
            animal_handling: data.skills?.animal_handling || 0,
            arcana: data.skills?.arcana || 0,
            athletics: data.skills?.athletics || 0,
            deception: data.skills?.deception || 0,
            history: data.skills?.history || 0,
            insight: data.skills?.insight || 0,
            intimidation: data.skills?.intimidation || 0,
            investigation: data.skills?.investigation || 0,
            medicine: data.skills?.medicine || 0,
            nature: data.skills?.nature || 0,
            perception: data.skills?.perception || 0,
            performance: data.skills?.performance || 0,
            persuasion: data.skills?.persuasion || 0,
            religion: data.skills?.religion || 0,
            slight_of_hand: data.skills?.slight_of_hand || 0,
            stealth: data.skills?.stealth || 0,
            survival: data.skills?.survival || 0
        };
        
        this.background = data.background || "";
    }

    clone() {
        const copy = new Character({
            id: this.id,
            name: this.name, 
            level: this.level,
            hitdice: this.hitdice,
            class: this.class,
            race: this.race,
            equipment: this.equipment,
            background: this.background,
        });
        copy.combat_skills = { ...this.combat_skills };
        copy.abilities = { ...this.abilities };
        copy.skills = { ...this.skills }
        return copy;
    }

    update_base(value, new_value) {
        this[value] = new_value;
        this._notify_server();
    }

    update_skills(skill, new_skill) {
        this.skills[skill] = new_skill;
        this._notify_server();
    }

    update_abilities(ability, new_ability) {
        this.abilities[ability] = new_ability;
        this._notify_server();
    }

    update_combat_skills(cskill, new_cskill) {
        this.combat_skills[cskill] = new_cskill;
        this._notify_server();
    }

    _notify_server() {
        fetch('http://localhost:8080/characters', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "mode": "update", "content": this.clone() })
        })
    }

    update_level(new_level) {
        this.level = new_level;
    }
    
    get_ability_modifier(ability_score) {
        return Math.floor((ability_score - 10) / 2);
    }
    
    to_json() {
        return JSON.stringify(this, null, 2);
    }
    
    static from_json(json_string) {
        return new Character(JSON.parse(json_string));
    }
}