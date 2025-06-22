package main

import (
	"encoding/json"
	"fmt"
	"os"
	"net/http"
	"io"
	"os/signal"
	"syscall"
)

var id_counter int = 0
func assign_id() int {
	next := id_counter
	id_counter+=1
	return next
}

var characters []Character

//var characters = []Character{
//	create_character("Thorin Ironbeard", "fighter", "dwarf", "A fallen soldier who fled the battlefield"),
//}

func process_post_request(request_body string, w http.ResponseWriter) {
	var request PostRequest
	err := json.Unmarshal([]byte(request_body), &request)
	if (err != nil) {
		return
	}

	if (request.Mode == "create") {
		var character Character = request.Content
		character.Id = len(characters) + 1
		characters = append(characters, character)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(character)
	}else if (request.Mode == "update") {
		id := request.Content.Id
		characters[id] = request.Content
	}else {
		// error
	}
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
	if (err != nil) {
		return false
	}

	err = json.Unmarshal(data, &characters)
	if (err != nil) {
		return false
	}
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
	if (!load_success) {
		fmt.Println("Failed to load saved character data")
	}

	server_program()

	save_character_data()
}
