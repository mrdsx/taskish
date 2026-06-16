package main

import (
	"log"
	"strconv"

	"github.com/go-playground/validator/v10"
	"github.com/spf13/cobra"
)

var Validate = validator.New()

func main() {
	rootCmd := &cobra.Command{
		Use:   "taskish",
		Short: "A CLI client for Taskish API.",
	}

	initcmd := &cobra.Command{
		Use:   "init",
		Short: "Initialize config for using CLI client",
		Run: func(cmd *cobra.Command, args []string) {
			HandleInit(InitConfig{})
		},
	}

	tasksCmd := &cobra.Command{
		Use:   "tasks [command]",
		Short: "Manage tasks",
		Args:  cobra.MaximumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			if len(args) == 0 {
				HandleGetAllTasks()
			} else {
				taskId, err := strconv.Atoi(args[0])
				if err != nil {
					log.Fatalf("invalid argument %q: must be a valid integer", args[0])
				}

				HandleGetTaskById(taskId)
			}
		},
	}

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

			HandleDeleteTasksById(ids)
		},
	}

	trashCmd := &cobra.Command{
		Use:   "trash",
		Short: "Get recently deleted tasks",
		Run: func(cmd *cobra.Command, args []string) {
			HandleGetTrash()
		},
	}

	restoreTaskCmd := &cobra.Command{
		Use:   "restore [taskId]",
		Short: "Restores recently deleted task",
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

			HandleRestoreTasksById(ids)
		},
	}

	rootCmd.AddCommand(initcmd, tasksCmd, trashCmd)
	tasksCmd.AddCommand(deleteTaskByIdCmd)
	trashCmd.AddCommand(restoreTaskCmd)

	if err := rootCmd.Execute(); err != nil {
		panic(err)
	}
}
