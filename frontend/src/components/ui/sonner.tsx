import { useColorMode } from "@kobalte/core";
import {
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon,
  LoaderCircleIcon,
  TriangleAlertIcon,
} from "lucide-solid";
import { Toaster as Sonner } from "somoto";

export function Toaster(props: Parameters<typeof Sonner>[0]) {
  const { colorMode } = useColorMode();

  return (
    <Sonner
      className="[&_svg]:size-4"
      theme={colorMode()}
      icons={{
        success: <CircleCheckIcon />,
        info: <InfoIcon />,
        warning: <TriangleAlertIcon />,
        error: <CircleXIcon />,
        loading: <LoaderCircleIcon class="animate-spin" />,
      }}
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
        "--border-radius": "var(--radius)",
      }}
      {...props}
    />
  );
}
