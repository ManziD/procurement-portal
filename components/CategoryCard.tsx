'use client'

import Link from 'next/link'
import { CATEGORY_ICONS } from '@/lib/constants'
import * as Icons from 'lucide-react'

interface CategoryCardProps {
  category: string
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const iconName = CATEGORY_ICONS[category] || 'Briefcase'
  const IconComponent = (Icons as any)[iconName] || Icons.Briefcase

  return (
    <Link
      href={`/request?category=${encodeURIComponent(category)}`}
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-4 text-center border border-gray-100 hover:border-primary-blue"
    >
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 bg-primary-blue/10 rounded-full flex items-center justify-center group-hover:bg-primary-blue group-hover:text-white transition-colors duration-300">
          <IconComponent className="h-6 w-6 text-primary-blue group-hover:text-white" />
        </div>
        <h3 className="mt-3 text-sm font-medium text-gray-800 group-hover:text-primary-blue">
          {category}
        </h3>
      </div>
    </Link>
  )
}
