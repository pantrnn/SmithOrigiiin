'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from 'react'

type AlertType = 'info' | 'success' | 'error'

type AlertContextType = {
  showAlert: (message: string, type?: AlertType) => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')
  const [type, setType] = useState<AlertType>('info')
  const timeoutRef = useRef<number | null>(null)

  const showAlert = useCallback((msg: string, alertType: AlertType = 'info') => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setMessage(msg)
    setType(alertType)
    setVisible(true)

    timeoutRef.current = window.setTimeout(() => {
      setVisible(false)
    }, 3000)
  }, [])

  const handleClose = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setVisible(false)
  }, [])

  const typeStyles = {
    success: 'border-green-600 text-green-700 bg-green-50',
    error: 'border-red-600 text-red-700 bg-red-50',
    info: 'border-blue-600 text-blue-700 bg-blue-50',
  }

  const typeIcons: Record<AlertType, React.ReactNode> = {
    success: <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />,
    error: <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />,
    info: <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />,
  }

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`
              fixed top-4 right-4 sm:top-5 sm:right-5 
              w-[calc(100vw-2rem)] max-w-[280px] sm:max-w-[320px]
              px-3 py-2.5 sm:px-4 sm:py-3 
              rounded-lg shadow-lg
              border-l-4 flex items-start gap-2 sm:gap-3 z-9999
              ${typeStyles[type]}
            `}
          >
            <div className="shrink-0 mt-0.5">{typeIcons[type]}</div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs sm:text-sm wrap-break-word">
                {message}
              </p>
            </div>

            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition shrink-0"
              aria-label="Close alert"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  )
}

export function useAlert() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider')
  }
  return context
}
