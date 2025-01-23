import * as React from "react"
import { cn } from "@/lib/utils"

interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  children: React.ReactNode
}

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  children: React.ReactNode
}

const Steps = React.forwardRef<HTMLDivElement, StepsProps>(
  ({ className, value, children, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children)
    const steps = childrenArray.map((step, index) => {
      if (React.isValidElement(step)) {
        return React.cloneElement(step as React.ReactElement<StepProps>, {
          ...step.props,
          className: cn(
            step.props.className,
            "relative flex items-center justify-center",
            {
              "after:absolute after:left-1/2 after:h-0.5 after:w-full after:bg-border": index !== childrenArray.length - 1,
            }
          ),
          "data-active": value === step.props.value,
          "data-complete": value > step.props.value,
        })
      }
      return step
    })

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between", className)}
        {...props}
      >
        {steps}
      </div>
    )
  }
)
Steps.displayName = "Steps"

const Step = React.forwardRef<HTMLDivElement, StepProps>(
  ({ className, value, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2",
          "[&[data-active='true']]:text-primary [&[data-complete='true']]:text-primary",
          "[&[data-active='true']_span]:bg-primary [&[data-complete='true']_span]:bg-primary",
          "[&[data-active='true']_span]:text-primary-foreground [&[data-complete='true']_span]:text-primary-foreground",
          className
        )}
        {...props}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {value}
        </span>
        {children}
      </div>
    )
  }
)
Step.displayName = "Step"

export { Steps, Step } 