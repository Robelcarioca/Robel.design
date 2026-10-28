import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-[14px] border border-[#E6E6E6] bg-white px-3 py-2 text-sm text-[#161616] placeholder:text-[#9A9A9A] transition-all outline-none focus-visible:border-[#EE5A2C] focus-visible:ring-2 focus-visible:ring-[#EE5A2C]/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
