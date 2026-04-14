"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type SwitchProps = Omit<
  React.ComponentProps<"button">,
  "defaultChecked" | "onChange"
> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  size?: "sm" | "default"
}

function Switch({
  className,
  checked,
  defaultChecked = false,
  disabled,
  onCheckedChange,
  onClick,
  size = "default",
  ...props
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked)
  const isControlled = checked !== undefined
  const isChecked = isControlled ? checked : internalChecked

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event)

    if (event.defaultPrevented || disabled) {
      return
    }

    const nextChecked = !isChecked

    if (!isControlled) {
      setInternalChecked(nextChecked)
    }

    onCheckedChange?.(nextChecked)
  }

  return (
    <button
      type="button"
      role="switch"
      data-slot="switch"
      data-size={size}
      data-checked={isChecked ? "" : undefined}
      data-unchecked={!isChecked ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      aria-checked={isChecked}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 dark:bg-foreground",
          isChecked &&
            "translate-x-[10px] dark:bg-primary-foreground group-data-[size=default]/switch:translate-x-[14px]",
          !isChecked && "translate-x-0"
        )}
      />
    </button>
  )
}

export { Switch }
