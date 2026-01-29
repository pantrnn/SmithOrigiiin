'use client'
import api from '@/lib/axios'
import { createContext, useContext, useEffect, useState } from 'react'

type FavoriteContextType = {
  favoriteIds: number[]
  toggleFavorite: (productId: number) => Promise<void>
}

const FavoriteContext = createContext<FavoriteContextType | null>(null)

export function FavoriteProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await api.get<{ data: { productId: number }[] }>('/favorites')
        setFavoriteIds(res.data.data.map(f => f.productId))
      } catch {
        setFavoriteIds([])
      }
    }

    fetchFavorites()
  }, [])

  const toggleFavorite = async (productId: number) => {
    if (favoriteIds.includes(productId)) {
      await api.delete(`/favorites/${productId}`)
      setFavoriteIds(prev => prev.filter(id => id !== productId))
    } else {
      await api.post('/favorites', { productId })
      setFavoriteIds(prev => [...prev, productId])
    }
  }

  return (
    <FavoriteContext.Provider value={{ favoriteIds, toggleFavorite }}>
      {children}
    </FavoriteContext.Provider>
  )
}

export const useFavorite = () => {
  const ctx = useContext(FavoriteContext)
  if (!ctx) throw new Error('useFavorite must be used inside FavoriteProvider')
  return ctx
}
