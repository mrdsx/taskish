package commands

import (
	"log"
	"strconv"
	"taskish/handlers"

	"github.com/spf13/cobra"
)

var TrashCmd = &cobra.Command{
	Use:   "trash [taskId]",
	Short: "Manage deleted tasks",
	Long:  "Manage deleted tasks. Right now it's possible to read and restore tasks.",
	Args:  cobra.MaximumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		if len(args) == 0 {
			handlers.HandleGetTrash()
		} else {
			taskId, err := strconv.Atoi(args[0])
			if err != nil {
				log.Fatalf("Invalid argument %q: must be a valid integer", args[0])
			}

			handlers.HandleGetDeletedTaskById(taskId)
		}
	},
}

var restoreTaskCmd = &cobra.Command{
	Use:   "restore [taskId]",
	Short: "Restore recently deleted task",
	Args:  cobra.MinimumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		ids := []int{}
		for _, arg := range args {
			taskId, err := strconv.Atoi(arg)
			if err != nil {
				log.Fatalf("Invalid argument %q: must be a valid integer", arg)
			}
			ids = append(ids, taskId)
		}

		handlers.HandleRestoreTasksById(ids)
	},
}

func InitializeTrashCmd() {
	TrashCmd.AddCommand(restoreTaskCmd)
}
