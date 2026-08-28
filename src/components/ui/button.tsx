import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-all duration-100 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 select-none border-2 border-foreground",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground nb-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_hsl(var(--nb-shadow-color))] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground nb-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_hsl(var(--nb-shadow-color))] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        outline:
          "bg-card text-foreground nb-shadow-sm hover:bg-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_hsl(var(--nb-shadow-color))] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground nb-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_hsl(var(--nb-shadow-color))] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        ghost:
          "border-transparent hover:bg-secondary hover:border-foreground",
        link:
          "border-transparent text-primary underline-offset-4 hover:underline",
        navy:
          "bg-foreground text-background nb-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_hsl(var(--nb-shadow-color))] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        pill:
          "rounded-sm border-2 border-foreground bg-card text-muted-foreground nb-shadow-sm hover:bg-secondary hover:text-foreground hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_hsl(var(--nb-shadow-color))] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
      },
      size: {
        default: "h-10 px-5 py-2 rounded-sm",
        sm: "h-8 rounded-sm px-3 text-xs",
        lg: "h-11 rounded-sm px-8 text-base",
        icon: "h-10 w-10 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
