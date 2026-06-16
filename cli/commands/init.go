package commands

import (
	"taskish/handlers"

	"github.com/spf13/cobra"
)

var InitCmd = &cobra.Command{
	Use:   "init",
	Short: "Initialize config",
	Long:  "Initialize config for further CLI usage.",
	Run: func(cmd *cobra.Command, args []string) {
		handlers.HandleInit(handlers.InitConfig{})
	},
}
