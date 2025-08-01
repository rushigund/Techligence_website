import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-accent/30 text-accent-foreground border border-accent/40 backdrop-blur-sm hover:bg-accent/40",
        secondary:
          "bg-accent/30 text-accent-foreground border border-accent/40 backdrop-blur-sm hover:bg-accent/40",
        destructive:
          "bg-destructive text-destructive-foreground border border-destructive/40 hover:bg-destructive/80",
        outline:
          "text-accent-foreground border border-accent/40 backdrop-blur-sm hover:bg-accent/20",
      },
    }
    ,
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
