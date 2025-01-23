import { toast } from "sonner"

interface NotificationOptions {
  description?: string
  duration?: number
}

export function useNotification() {
  const success = (title: string, options?: NotificationOptions) => {
    toast.success(title, {
      duration: options?.duration || 4000,
      description: options?.description,
    })
  }

  const error = (title: string, options?: NotificationOptions) => {
    toast.error(title, {
      duration: options?.duration || 4000,
      description: options?.description,
    })
  }

  const warning = (title: string, options?: NotificationOptions) => {
    toast.warning(title, {
      duration: options?.duration || 4000,
      description: options?.description,
    })
  }

  const info = (title: string, options?: NotificationOptions) => {
    toast.info(title, {
      duration: options?.duration || 4000,
      description: options?.description,
    })
  }

  const promise = <T>(
    promise: Promise<T>,
    {
      loading = "Carregando...",
      success = "Operação concluída!",
      error = "Ocorreu um erro",
    } = {}
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    })
  }

  return {
    success,
    error,
    warning,
    info,
    promise,
  }
} 