package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/signal"
	"syscall"
)

// var characters []Character
var characters map[int]Character
var id_counter int = 0

func assign_id() int {
	next := id_counter
	for true {
		id_counter += 1
		_, exists := characters[next]
		if exists {
			continue
		}
		break
	}
	return next
}

func process_post_request(request_body string, w http.ResponseWriter) {
	var character Character
	var request PostRequest
	err := json.Unmarshal([]byte(request_body), &request)
	if err != nil {
		fmt.Println(err)
		return
	}

	switch request.Mode {
	case "create":
		character = request.Content
		character.Id = assign_id()
		characters[character.Id] = character
	case "update":
		id := request.Content.Id
		characters[id] = request.Content
		character = characters[id]
	case "create_random":
		character = create_random_character()
		characters[character.Id] = character
	case "delete":
		delete(characters, request.Character_id)
	case "item_add":
		character_id := request.Character_id
		character = characters[character_id]
		character.Equipment = append(character.Equipment, request.AddedItem)
		characters[character_id] = character
	case "item_update":
		character_id := request.Character_id
		character = characters[character_id]
		if request.ItemIndex >= 0 && request.ItemIndex < len(character.Equipment) {
			character.Equipment[request.ItemIndex] = request.AddedItem
			characters[character_id] = character
		}
	case "reroll_abilities":
		character_id := request.Character_id
		character = characters[character_id]
		character.Abilities = roll_abilities()
		characters[character_id] = character

	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(character)
}

func characters_handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, Origin")
	w.Header().Set("Access-Control-Max-Age", "86400")
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")

	switch r.Method {
	case "OPTIONS":
		// Handle CORS preflight requests
		w.WriteHeader(http.StatusOK)
		return
	case "GET":
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(characters)
	case "POST":
		fmt.Println("C")
		body_bytes, err := io.ReadAll(r.Body)
		if err != nil {
			panic(err)
		}
		body_string := string(body_bytes)

		process_post_request(body_string, w)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func save_character_data() {
	json_data, err := json.MarshalIndent(characters, "", "  ")
	if err != nil {
		return
	}

	err = os.WriteFile("../datastore/datastore.json", json_data, 0644)
	if err != nil {
		return
	}
}

func load_saved_data() bool {
	data, err := os.ReadFile("../datastore/datastore.json")
	if err != nil {
		return false
	}

	err = json.Unmarshal(data, &characters)
	if err != nil {
		return false
	}

	id_counter = len(characters)
	return true
}

func server_program() {
	http.HandleFunc("/characters", characters_handler)

	fmt.Println("API server running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

func main() {
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-c
		save_character_data()
		os.Exit(0)
	}()

	load_success := load_saved_data()
	if !load_success {
		fmt.Println("Failed to load saved character data")
	}

	server_program()

	save_character_data()
}
