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

type Task struct {
	Id       int      `json:"id"       validate:"required"`
	Title    string   `json:"title"    validate:"required,min=1"`
	SubTasks []string `json:"subTasks" validate:"required"`
}

func (t Task) Validate() error {
	return lib.Validate.Struct(t)
}

type TaskIn struct {
	Title    string   `json:"title"    validate:"required,min=1"`
	SubTasks []string `json:"subTasks" validate:"required"`
}

func (t TaskIn) Validate() error {
	return lib.Validate.Struct(t)
}

func GetTaskString(task Task) string {
	taskString := fmt.Sprintf("%s (%d)", task.Title, task.Id)
	subTasks := strings.Join(task.SubTasks, "\n  ")
	if len(subTasks) > 0 {
		taskString += fmt.Sprintf("\n  %s", subTasks)
	}

	return taskString
}

func printTasks(tasks []Task) {
	for index, task := range tasks {
		fmt.Printf("%d. %s (%d)\n", index+1, task.Title, task.Id)
	}
}

func HandleGetAllTasks() {
	res, err := lib.FetchApi(lib.FetchConfig{Method: "GET", Path: "/tasks"})
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()

	var tasks []Task
	json.NewDecoder(res.Body).Decode(&tasks)
	for _, task := range tasks {
		if err = task.Validate(); err != nil {
			log.Fatalf("Response body validation failed:\n%v", err)
		}
	}

	if len(tasks) == 0 {
		fmt.Println("Task list is empty")
		return
	}

	printTasks(tasks)
}

func HandleGetTaskById(id int) {
	res, err := lib.FetchApi(lib.FetchConfig{
		Method: "GET",
		Path:   "/tasks/" + strconv.Itoa(id),
		Overrides: lib.Overrides{
			NotFound: "Task not found",
		},
	})
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()

	var task Task
	json.NewDecoder(res.Body).Decode(&task)
	if err = task.Validate(); err != nil {
		log.Fatalf("Response body validation failed:\n%v", err)
	}

	fmt.Println(GetTaskString(task))
}

func HandleAddTask(title string, subTasks []string) {
	taskIn := TaskIn{Title: title, SubTasks: subTasks}
	taskIn.Title = strings.TrimSpace(taskIn.Title)
	err := taskIn.Validate()
	if err != nil {
		log.Fatalf("Invalid payload: %v\n", err)
	}

	jsonBytes, err := json.Marshal(taskIn)
	if err != nil {
		panic(err)
	}

	res, err := lib.FetchApi(lib.FetchConfig{
		Method:      "POST",
		Path:        "/tasks",
		Body:        jsonBytes,
		ContentType: "application/json",
	})
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()

	// Example output: Added task "batman"
	fmt.Printf("Added task %q\n", taskIn.Title)
}

func HandleSetTaskById(id int, title string, subTasks []string, clearSubTasks bool) {
	taskMap := make(map[string]any, 2)
	if len(title) > 0 {
		taskMap["title"] = title
	}
	if len(subTasks) > 0 {
		taskMap["subTasks"] = subTasks
	} else if clearSubTasks {
		taskMap["subTasks"] = []string{}
	}

	if len(taskMap) == 0 {
		fmt.Println("No data to send")
		return
	}

	jsonBytes, err := json.Marshal(taskMap)
	if err != nil {
		log.Fatalf("Error serializing map: %v", err)
	}

	res, err := lib.FetchApi(lib.FetchConfig{
		Method:      "PATCH",
		Path:        "/tasks/" + strconv.Itoa(id),
		Body:        jsonBytes,
		ContentType: "application/json",
		Overrides: lib.Overrides{
			NotFound: "Task not found",
		},
	})
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()

	fmt.Printf("Update task with ID %d\n", id)
}

func HandleDeleteTasksById(ids []int) {
	res, err := lib.FetchApi(lib.FetchConfig{Method: "GET", Path: "/tasks"})
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()

	var tasks []Task
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

	fmt.Println("You're about to delete the following tasks:")
	fmt.Println(strings.Join(taskStrings, "\n"))
	answer := lib.Prompt("Do you confirm? [y/N] ")
	if answer != "y" {
		return
	}

	var wg sync.WaitGroup
	for _, taskId := range taskIds {
		wg.Add(1)
		go handleDeleteTaskById(taskId, &wg)
	}
	wg.Wait()
}

func handleDeleteTaskById(id int, wg *sync.WaitGroup) {
	defer wg.Done()

	res, err := lib.FetchApi(lib.FetchConfig{Method: "DELETE", Path: "/tasks/" + strconv.Itoa(id)})
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()
	fmt.Printf("Deleted task with ID %d\n", id)
}
