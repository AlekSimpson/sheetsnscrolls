package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

var characters = []Character{
	{
		0,
		"Thorin Ironbeard",
		5,
		fighter,
		dwarf,
		AbilityScores{16, 12, 15, 10, 13, 14},
		CombatStats{52, 52, 18, 30},
		[]Item{},
		map[string]int{},
		"default background",
	},
}

func users_handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:8000")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	switch r.Method {
	case "GET":
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(characters)
	case "POST":
		var character Character
		json.NewDecoder(r.Body).Decode(&character)
		character.Id = len(characters) + 1
		characters = append(characters, character)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(character)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

//func user_handler(w http.ResponseWriter, r *http.Request) {
//	path_parts := strings.Split(r.URL.Path, "/")
//	if len(path_parts) < 3 {
//		http.NotFound(w, r)
//		return
//	}
//
//	id, err := strconv.Atoi(path_parts[2])
//	if err != nil {
//		http.Error(w, "Invalid user ID", http.StatusBadRequest)
//		return
//	}
//
//	for _, character := range characters {
//		if character.Id == id {
//			w.Header().Set("Content-Type", "application/json")
//			json.NewEncoder(w).Encode(character)
//			return
//		}
//	}
//
//	http.NotFound(w, r)
//}

func main() {
	http.HandleFunc("/characters", users_handler)
	// http.HandleFunc("/user/", user_handler)

	fmt.Println("API server running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
