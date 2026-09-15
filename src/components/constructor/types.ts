import type { InviteConfig } from "@/lib/invite/types";

export interface StepProps {
  config: InviteConfig;
  update: (updater: (current: InviteConfig) => InviteConfig) => void;
}
