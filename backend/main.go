package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

var id_counter int = 0
func assign_id() int {
	next := id_counter
	id_counter+=1
	return next
}

var characters = []Character{
	create_character("Thorin Ironbeard", "fighter", "dwarf", "A fallen soldier who fled the battlefield"),
}

func characters_handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
    w.Header().Set("Pragma", "no-cache")
    w.Header().Set("Expires", "0")

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

func main() {
	http.HandleFunc("/characters", characters_handler)

	fmt.Println("API server running on https://localhost:8080")
	http.ListenAndServeTLS(":8080", "./localhost+1.pem", "./localhost+1-key.pem", nil)
}
