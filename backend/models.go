package main

import (
	"math"
	"math/rand"
	"slices"
	"time"
)

var default_hitdice = map[string]int{
	"sorcerer":  6,
	"wizard":    6,
	"artificer": 8,
	"bard":      8,
	"cleric":    8,
	"druid":     8,
	"monk":      8,
	"rogue":     8,
	"warlock":   8,
	"fighter":   10,
	"paladin":   10,
	"ranger":    10,
	"barbarian": 12,
}

type AbilityScores struct {
	Strength     int `json:"strength"`
	Dexterity    int `json:"dexterity"`
	Constitution int `json:"constitution"`
	Intelligence int `json:"intelligence"`
	Wisdom       int `json:"wisdom"`
	Charisma     int `json:"charisma"`
}

func (a AbilityScores) modifier(ability string) int {
	var score int
	switch ability {
	case "strength", "str":
		score = a.Strength
	case "dexterity", "dex":
		score = a.Dexterity
	case "constitution", "con":
		score = a.Constitution
	case "intelligence", "int":
		score = a.Intelligence
	case "wisdom", "wis":
		score = a.Wisdom
	case "charisma", "cha":
		score = a.Charisma
	default:
		return 0
	}
	return (score - 10) / 2
}

type CombatStats struct {
	Health_points     int `json:"hp"`
	Max_health_points int `json:"max_hp"`
	Armor_class       int `json:"ac"`
	Speed             int `json:"speed"`
}

type Item struct {
	Name         string `json:"name"`
	Range        int    `json:"range"`
	Hitdie_bonus int    `json:"hitdie_bonus"`
	Amount       int    `json:"amount"`
	Description  string `json:"description"`
	Damage       string `json:"damage"`
	Notes        string `json:"notes"`
}

type Character struct {
	Id           int                    `json:"id"`
	Name         string                 `json:"name"`
	Level        int                    `json:"level"`
	Class        string                 `json:"class"`
	Hitdice      int                    `json:"hitdice"`
	Race         string                 `json:"race"`
	Abilities    AbilityScores          `json:"abilities"`
	Combat_stats CombatStats            `json:"combat_skills"`
	Equipment    []Item                 `json:"equipment"`
	Skills       map[string]interface{} `json:"skills"`
	Background   string                 `json:"background"`
}

func create_character(name string, class string, race string, background string) Character {
	generate_combat_stats := func(class string, level int, abilities AbilityScores) CombatStats {
		hitdice := default_hitdice[class]
		hp := int(math.Abs(float64(hitdice+(level*hitdice)+(2*level)+(2*level*abilities.modifier("constitution"))-2) / 2))
		if hp == 0 {
			hp = 1
		}
		max_hp := hp
		ac := 10 + abilities.modifier("dex")
		return CombatStats{
			Health_points:     hp,
			Max_health_points: max_hp,
			Armor_class:       ac,
			Speed:             30, // TODO: figure out how we want to auto set this
		}
	}

	roll_abilities := func() AbilityScores {
		rolld6 := func() int {
			rand.Seed(time.Now().UnixNano())
			return rand.Intn(6) + 1
		}

		roll_ability := func() int {
			rolls := []int{}
			for range 4 {
				rolls = append(rolls, rolld6())
			}

			slices.Sort(rolls)

			kept_rolls := rolls[1:]
			score := 0
			for _, value := range kept_rolls {
				score += value
			}
			return score
		}

		return AbilityScores{
			Strength:     roll_ability(),
			Dexterity:    roll_ability(),
			Constitution: roll_ability(),
			Intelligence: roll_ability(),
			Wisdom:       roll_ability(),
			Charisma:     roll_ability(),
		}
	}

	level := 1
	abilities := roll_abilities()
	combat := generate_combat_stats(class, level, abilities)
	var skillmap = map[string]interface{}{
		"acrobatics":      abilities.Dexterity,
		"animal handling": abilities.Wisdom,
		"arcana":          abilities.Intelligence,
		"athletics":       abilities.Strength,
		"deception":       abilities.Charisma,
		"history":         abilities.Intelligence,
		"insight":         abilities.Wisdom,
		"intimidation":    abilities.Charisma,
		"investigation":   abilities.Intelligence,
		"medicine":        abilities.Wisdom,
		"nature":          abilities.Intelligence,
		"perception":      abilities.Wisdom,
		"performance":     abilities.Charisma,
		"persuasion":      abilities.Charisma,
		"religion":        abilities.Intelligence,
		"slight of hand":  abilities.Dexterity,
		"stealth":         abilities.Dexterity,
		"survival":        abilities.Wisdom,
	}

	return Character{
		Id:           assign_id(),
		Name:         name,
		Level:        level,
		Class:        class,
		Hitdice:      default_hitdice[class],
		Race:         race,
		Abilities:    abilities,
		Combat_stats: combat,
		Equipment:    []Item{},
		Skills:       skillmap,
		Background:   background,
	}
}

func create_random_character() Character {
	RACES := []string{"Human", "Elf", "Dwarf", "Halfling", "Dragonborn", "Gnome", "Half-Elf", "Half-Orc", "Tiefling"}
	CLASSES := []string{"Fighter", "Wizard", "Rogue", "Cleric", "Ranger", "Paladin", "Barbarian", "Bard", "Druid", "Monk", "Sorcerer", "Warlock"}
	FIRST_NAMES := []string{"Aelindra", "Beiro", "Carric", "Drannor", "Enna", "Galinndan", "Haliath", "Ivellios", "Korfel", "Lamlis", "Mindartis", "Nutae", "Paelynn", "Peren", "Quarion", "Riardon", "Rolen", "Silvyr", "Suhnaal", "Thamior", "Theriatis", "Therivayas", "Vanuath", "Varis"}
	LAST_NAMES := []string{"Amakir", "Amarthen", "Amaeriel", "Aramithare", "Aranala", "Berrian", "Caelynn", "Carric", "Dayereth", "Enna", "Galinndan", "Hadarai", "Haliath", "Helder", "Himo", "Immeral", "Ivellios", "Korfel", "Lamlis", "Laucian", "Mindartis", "Nutae", "Paelynn", "Peren", "Quarion", "Riardon", "Rolen"}
	BACKGROUNDS := []string{"Acolyte", "Criminal", "Folk Hero", "Noble", "Sage", "Soldier", "Charlatan", "Entertainer", "Guild Artisan", "Hermit", "Outlander", "Sailor"}

	name := FIRST_NAMES[rand.Intn(len(FIRST_NAMES))] + " " + FIRST_NAMES[rand.Intn(len(LAST_NAMES))]
	class := CLASSES[rand.Intn(len(CLASSES))]
	race := RACES[rand.Intn(len(RACES))]
	background := BACKGROUNDS[rand.Intn(len(BACKGROUNDS))]
	return create_character(name, class, race, background)
}

type PostRequest struct {
	Mode         string    `json:"mode"`
	Content      Character `json:"content"`
	Character_id int       `json:"character_id"`
	AddedItem    Item      `json:"item"`
}
