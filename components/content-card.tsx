"use client"

import { useState } from "react"

interface ContentCardProps {
  content: {
    id: string
    title: string
    genre: string
    description: string
    type: "movie" | "music"
    image: string
  }
}

export default function ContentCard({ content }: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative mb-4 overflow-hidden rounded-lg aspect-[3/4] bg-surface-light">
        <img
          src={content.image || "/placeholder.svg"}
          alt={content.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-60"
          }`}
        />

        {/* Hover Info */}
        {isHovered && (
          <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
            <p className="text-sm text-gray-300 mb-3">{content.description}</p>
            <button className="w-full py-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 rounded font-medium text-sm transition-all duration-300">
              자세히 보기
            </button>
          </div>
        )}
      </div>

      {/* Content Info */}
      <div>
        <h3 className="font-bold text-gray-100 mb-1 truncate">{content.title}</h3>
        <p className="text-sm text-gray-400">{content.genre}</p>
      </div>
    </div>
  )
}
