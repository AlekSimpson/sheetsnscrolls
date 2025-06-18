package main

type Race int

const (
	dwarf Race = iota
)

type Class int

const (
	fighter Class = iota
)

type AbilityScores struct {
	strength     int
	dexterity    int
	constitution int
	intelligence int
	wisdom       int
	charisma     int
}

type CombatStats struct {
	Health_points     int
	Max_health_points int
	Armor_class       int
	Speed             int
}

type Item struct {
	Name        int
	Description string
}

type Character struct {
	Id           int            `json:"id"`
	Name         string         `json:"name"`
	Level        int            `json:"level"`
	Class        Class          `json:"class"`
	Race         Race           `json:"race"`
	Abilities    AbilityScores  `json:"abilities"`
	Combat_stats CombatStats    `json:"combat_skills"`
	Equipment    []Item         `json:"equipment"`
	Skills       map[string]int `json:"skills"`
	Backgrond    string         `json:"background"`
}
