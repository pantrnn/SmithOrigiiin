'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react'

type ConfirmContextType = {
  confirmDialog: (message: string) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')
  const [resolver, setResolver] = useState<((result: boolean) => void) | null>(null)

  const confirmDialog = (msg: string): Promise<boolean> => {
    setMessage(msg)
    setVisible(true)
    return new Promise((resolve) => setResolver(() => resolve))
  }

  const handleConfirm = (result: boolean) => {
    setVisible(false)
    resolver?.(result)
  }

  return (
    <ConfirmContext.Provider value={{ confirmDialog }}>
      {children}

      {visible && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-5000">
          <div className="bg-white rounded-xl shadow-lg w-[320px] p-5 text-center animate-fade-in">
            <p className="text-gray-800 mb-6">{message}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleConfirm(false)}
                className="px-4 py-2 rounded-lg cursor-pointer border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={() => handleConfirm(true)}
                className="px-4 py-2 rounded-lg cursor-pointer bg-red-600 text-white hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) throw new Error('useConfirm must be used within a ConfirmProvider')
  return context
}
