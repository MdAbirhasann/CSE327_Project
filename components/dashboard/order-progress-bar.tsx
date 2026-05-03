"use client";

import { cn } from "@/lib/utils";
import { ORDER_STAGES, getActiveStageIndex, getSegmentState } from "@/lib/order-stages";

interface OrderProgressBarProps {
  status: string;
  showLabels?: boolean;
}

export function OrderProgressBar({ status, showLabels = false }: OrderProgressBarProps) {
  const activeIdx = getActiveStageIndex(status);

  return (
    <div className="flex w-full gap-1.5">
      {ORDER_STAGES.map((stage, i) => {
        const state = getSegmentState(i, activeIdx);
        return (
          <div key={stage.label} className="flex flex-1 flex-col gap-1.5">
            <div
              className={cn(
                "relative h-2 overflow-hidden",
                state === "done" && "bg-primary",
                state === "active" && "bg-border",
                state === "upcoming" && "bg-border"
              )}
            >
              {state === "active" && (
                <div
                  className="bg-primary absolute inset-y-0 left-0 w-full origin-left"
                  style={{ animation: "progress-sweep 1s ease-in-out infinite" }}
                />
              )}
            </div>
            {showLabels && (
              <span
                className={cn(
                  "text-[10px] font-medium",
                  state === "active" && "text-primary font-semibold",
                  state === "done" && "text-muted-foreground",
                  state === "upcoming" && "text-muted-foreground/40"
                )}
              >
                {stage.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
