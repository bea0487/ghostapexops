import React from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = {
  variant: {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_hsl(174_72%_56%/0.5)]",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary/10 hover:shadow-[0_0_15px_hsl(174_72%_56%/0.3)]",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-[0_0_20px_hsl(280_85%_65%/0.5)]",
    ghost: "hover:bg-accent/20 hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
    cyber: "bg-gradient-to-r from-primary via-secondary to-accent text-background hover:shadow-[0_0_30px_hsl(174_72%_56%/0.5),0_0_60px_hsl(280_85%_65%/0.3)] hover:-translate-y-0.5",
    cyberOutline: "border-2 border-transparent bg-card text-foreground cyber-gradient-border hover:shadow-[0_0_20px_hsl(174_72%_56%/0.4)]",
    cyberGhost: "bg-transparent text-foreground hover:bg-primary/10 hover:text-primary",
  },
  size: {
    default: "h-11 px-6 py-2",
    sm: "h-9 rounded-md px-4 text-sm",
    lg: "h-12 rounded-lg px-8 text-base",
    xl: "h-14 rounded-xl px-10 text-lg",
    icon: "h-10 w-10",
  },
}

const Button = React.forwardRef(({ 
  className, 
  variant = 'default', 
  size = 'default', 
  children,
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold uppercase tracking-wider ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-body"
  
  const variantClasses = buttonVariants.variant[variant] || buttonVariants.variant.default
  const sizeClasses = buttonVariants.size[size] || buttonVariants.size.default
  
  return (
    <button
      className={cn(baseClasses, variantClasses, sizeClasses, className)}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = "Button"

export { Button, buttonVariants }