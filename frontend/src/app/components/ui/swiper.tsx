'use client'
import Image from 'next/image'
import api from '../../../lib/axios'
import { AxiosError } from 'axios'
import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'

interface Banner {
  id: number
  imageUrl: string
}

export default function Carousel() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [index, setIndex] = useState(0)

  useEffect(() => {
    fetchBanners()
  }, [])

  useEffect(() => {
    if (banners.length < 2) return
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [banners])

  const fetchBanners = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/banners')
      setBanners(res.data.data)
    } catch (e) {
      const err = e as AxiosError<{ message?: string }>
      setError(err.response?.data?.message || 'Gagal memuat banner')
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = () => {
    if (banners.length < 2) return
    setIndex((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    if (banners.length < 2) return
    setIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  if (loading) {
    return (
      <div className="w-full flex flex-col gap-6 md:gap-10">
        <h1 className="text-center text-xl md:text-2xl font-bold px-4">
          What&apos;s New?
        </h1>
        <p className="text-center text-gray-500">Memuat banner...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full flex flex-col gap-6 md:gap-10">
        <h1 className="text-center text-xl md:text-2xl font-bold px-4">
          What&apos;s New?
        </h1>
        <p className="text-center text-red-500">{error}</p>
      </div>
    )
  }

  if (banners.length === 0) {
    return (
      <div className="w-full flex flex-col gap-3 md:gap-5">
        <h1 className="text-center text-xl md:text-2xl font-bold px-4">
          What&apos;s New?
        </h1>
        <div className="flex flex-col items-center gap-3 py-8">
          <ImageOff className="w-10 h-10 text-gray-300" />
          <p className="text-gray-500 text-base md:text-lg">Tidak ada banner tersedia</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-4 md:gap-6 relative">
      <h1 className="text-center font-bold text-xl md:text-2xl">
        What&apos;s New?
      </h1>

      <div className="relative w-full max-w-375 mx-auto aspect-video md:aspect-2/1 overflow-hidden rounded-lg select-none">
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {banners.map((banner) => (
            <div key={banner.id} className="relative min-w-full h-full">
              <Image
                src={banner.imageUrl}
                alt="banner"
                fill
                priority
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {banners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute cursor-pointer top-1/2 left-2 md:left-4 -translate-y-1/2 z-20 bg-white/80 backdrop-blur p-1.5 md:p-2 rounded-full shadow hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5 md:w-7 md:h-7 text-gray-700" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute cursor-pointer top-1/2 right-2 md:right-4 -translate-y-1/2 z-20 bg-white/80 backdrop-blur p-1.5 md:p-2 rounded-full shadow hover:bg-white"
            >
              <ChevronRight className="w-5 h-5 md:w-7 md:h-7 text-gray-700" />
            </button>

            <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2">
              {banners.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`cursor-pointer rounded transition-all ${
                    index === i
                      ? 'bg-white w-6 md:w-8 h-1.5'
                      : 'bg-gray-400 w-4 md:w-6 h-1.5'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}