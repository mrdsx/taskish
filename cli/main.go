package main

import (
	"fmt"
	"log"
	"strconv"
	"strings"
	"taskish/handlers"
	"taskish/lib"

	"github.com/spf13/cobra"
)

func main() {
	rootCmd := &cobra.Command{
		Use:   lib.AppName,
		Short: fmt.Sprintf("A CLI client for %s API.", lib.AppName),
	}

	initcmd := &cobra.Command{
		Use:   "init",
		Short: "Initialize config",
		Long:  "Initialize config for further CLI usage.",
		Run: func(cmd *cobra.Command, args []string) {
			handlers.HandleInit(handlers.InitConfig{})
		},
	}

	tasksCmd := &cobra.Command{
		Use:   "tasks [...taskId]",
		Short: "Manage tasks",
		Args:  cobra.MaximumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			if len(args) == 0 {
				handlers.HandleGetAllTasks()
			} else {
				taskId, err := strconv.Atoi(args[0])
				if err != nil {
					log.Fatalf("invalid argument %q: must be a valid integer", args[0])
				}

				handlers.HandleGetTaskById(taskId)
			}
		},
	}

	addTaskCmd := &cobra.Command{
		Use:   "add [title] [subTasks]",
		Short: "Create task",
		Args:  cobra.RangeArgs(1, 2),
		Example: fmt.Sprintf(`  %s tasks add task
  %s tasks add task "step 1,hands up, step 2, thumbs up"`, lib.AppName, lib.AppName),
		Run: func(cmd *cobra.Command, args []string) {
			title := args[0]
			subTasks := []string{}
			if len(args) == 2 {
				subTasks = strings.Split(args[1], ",")
				for index, task := range subTasks {
					subTasks[index] = strings.TrimSpace(task)
				}
			}

			handlers.HandleAddTask(title, subTasks)
		},
	}

	// setTaskByIdCmd := &cobra.Command{
	// 	Use:   "set [taskId]",
	// 	Short: "Update task",
	// }

	deleteTaskByIdCmd := &cobra.Command{
		Use:     "del [...taskId]",
		Short:   "Delete one or multiple tasks by ID",
		Aliases: []string{"delete"},
		Args:    cobra.MinimumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			ids := []int{}
			for _, arg := range args {
				taskId, err := strconv.Atoi(arg)
				if err != nil {
					log.Fatalf("invalid argument %q: must be a valid integer", arg)
				}
				ids = append(ids, taskId)
			}

			handlers.HandleDeleteTasksById(ids)
		},
	}

	trashCmd := &cobra.Command{
		Use:   "trash",
		Short: "Manage deleted tasks",
		Long:  "Manage deleted tasks. Right now it's possible to read and restore tasks.",
		Run: func(cmd *cobra.Command, args []string) {
			handlers.HandleGetTrash()
		},
	}

	restoreTaskCmd := &cobra.Command{
		Use:   "restore [taskId]",
		Short: "Restore recently deleted task",
		Args:  cobra.MinimumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			ids := []int{}
			for _, arg := range args {
				taskId, err := strconv.Atoi(arg)
				if err != nil {
					log.Fatalf("invalid argument %q: must be a valid integer", arg)
				}
				ids = append(ids, taskId)
			}

			handlers.HandleRestoreTasksById(ids)
		},
	}

	rootCmd.AddCommand(initcmd, tasksCmd, trashCmd)
	tasksCmd.AddCommand(addTaskCmd, deleteTaskByIdCmd)
	trashCmd.AddCommand(restoreTaskCmd)

	if err := rootCmd.Execute(); err != nil {
		panic(err)
	}
}
