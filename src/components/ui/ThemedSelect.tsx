import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ThemedSelectProps extends React.ComponentPropsWithoutRef<typeof SelectTrigger> {
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode; // Expected to be SelectItem components
  className?: string;
}

const ThemedSelect = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  ThemedSelectProps
>(({ className, placeholder, value, onValueChange, children, ...props }, ref) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        ref={ref}
        className={cn(
          "w-full p-3 rounded-lg border bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-xl shadow-2xl border bg-popover text-popover-foreground">
        {children}
      </SelectContent>
    </Select>
  );
});
ThemedSelect.displayName = "ThemedSelect";

export default ThemedSelect;