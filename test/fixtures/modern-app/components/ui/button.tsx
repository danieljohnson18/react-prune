import * as React from "react"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button ref={ref} {...props} />
    )
  }
)
Button.displayName = "Button"

export { Button }
