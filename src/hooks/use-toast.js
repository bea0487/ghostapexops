import { toast as sonnerToast } from 'sonner'

export const useToast = () => {
  const toast = ({ title, description, variant = 'default', ...props }) => {
    if (variant === 'destructive') {
      return sonnerToast.error(title, {
        description,
        ...props
      })
    }
    
    if (variant === 'success') {
      return sonnerToast.success(title, {
        description,
        ...props
      })
    }
    
    return sonnerToast(title, {
      description,
      ...props
    })
  }

  return { toast }
}