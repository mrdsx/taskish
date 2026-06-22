package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"slices"
	"strconv"
	"strings"
	"sync"
	"taskish/lib"
)

type DeletedTask struct {
	Task
	// human-readable string like "expired", "expires in 6 seconds", "expires in 7 miutes", etc.
	ExpiresAt string `json:"expiresAt" validate:"required"`
}

func (t DeletedTask) Validate() error {
	return lib.Validate.Struct(t)
}

func HandleGetTrash() {
	res, err := lib.FetchApi(lib.FetchConfig{Method: "GET", Path: "/trash"})
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()

	var deletedTasks []DeletedTask
	json.NewDecoder(res.Body).Decode(&deletedTasks)
	for _, task := range deletedTasks {
		if err = task.Validate(); err != nil {
			log.Fatalf("Response body validation failed:\n%v", err)
		}
	}

	if len(deletedTasks) == 0 {
		fmt.Println("Trash is empty")
	}

	for index, task := range deletedTasks {
		fmt.Printf(
			"%d. %s (%d) - %s\n",
			index+1,
			task.Title,
			task.Id,
			task.ExpiresAt,
		)
	}
}

func HandleGetDeletedTaskById(id int) {
	res, err := lib.FetchApi(lib.FetchConfig{
		Method: "GET",
		Path:   "/trash/" + strconv.Itoa(id),
		Overrides: lib.Overrides{
			NotFound: "Task not found",
		},
	})
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()

	var task DeletedTask
	err = json.NewDecoder(res.Body).Decode(&task)
	if err != nil {
		log.Fatalf("Response body validation failed:\n%v", err)
	}

	taskString := fmt.Sprintf("%s (%d) - %s", task.Title, task.Id, task.ExpiresAt)
	subTasks := strings.Join(task.SubTasks, "\n  ")
	if len(subTasks) > 0 {
		taskString += fmt.Sprintf("\n  %s", subTasks)
	}

	fmt.Println(taskString)
}

func HandleRestoreTasksById(ids []int) {
	res, err := lib.FetchApi(lib.FetchConfig{Method: "GET", Path: "/trash"})
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()

	var tasks []DeletedTask
	json.NewDecoder(res.Body).Decode(&tasks)
	for _, task := range tasks {
		if err = task.Validate(); err != nil {
			log.Fatalf("Response body validation failed:\n%v", err)
		}
	}

	taskStrings := []string{}
	taskIds := []int{}
	temp_idx := 0
	for _, task := range tasks {
		if slices.Contains(ids, task.Id) {
			temp_idx += 1
			str := fmt.Sprintf("  %d. %s (%d)", temp_idx, task.Title, task.Id)
			taskStrings = append(taskStrings, str)
			taskIds = append(taskIds, task.Id)
		}
	}

	if len(taskStrings) == 0 {
		fmt.Println("No tasks with specified IDs found")
		return
	}

	fmt.Println("You're about to restore the following tasks:")
	fmt.Println(strings.Join(taskStrings, "\n"))
	answer := lib.Prompt("Do you confirm? [y/N] ")
	if answer != "y" {
		return
	}

	var wg sync.WaitGroup
	for _, taskId := range taskIds {
		wg.Add(1)
		go handleRestoreTaskById(taskId, &wg)
	}
	wg.Wait()
}

func handleRestoreTaskById(id int, wg *sync.WaitGroup) {
	defer wg.Done()

	res, err := lib.FetchApi(lib.FetchConfig{Method: "POST", Path: "/trash/" + strconv.Itoa(id)})
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()
	fmt.Printf("Restored task with ID %d\n", id)
}
