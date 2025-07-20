import * as React from "react"
import { useTheme } from "./GlobalUI"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { currentThemeData } = useTheme();
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border",
        className
      )}
      style={{
        backgroundColor: currentThemeData.surface,
        color: currentThemeData.text,
        borderColor: currentThemeData.border,
        boxShadow: `0 4px 12px -2px ${currentThemeData.border}33`,
      }}
      {...props}
    />
  );
});
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { currentThemeData } = useTheme();
  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      style={{ color: currentThemeData.text }}
      {...props}
    />
  );
});
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const { currentThemeData } = useTheme();
  return (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      style={{ color: currentThemeData.text }}
      {...props}
    />
  );
});
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { currentThemeData } = useTheme();
  return (
    <p
      ref={ref}
      className={cn("text-sm", className)}
      style={{ color: currentThemeData.textSecondary }}
      {...props}
    />
  );
});
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { currentThemeData } = useTheme();
  return (
    <div
      ref={ref}
      className={cn("p-6 pt-0", className)}
      style={{ color: currentThemeData.text }}
      {...props}
    />
  );
});
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { currentThemeData } = useTheme();
  return (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      style={{ color: currentThemeData.text }}
      {...props}
    />
  );
});
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
