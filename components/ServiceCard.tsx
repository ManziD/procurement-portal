'use client'

import Link from 'next/link'
import { MapPin, Clock, Users, MessageCircle } from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

interface ServiceCardProps {
  service: {
    id: string
    title: string
    category: string
    budget: number
    location: string
    division: string
    provider_name?: string
    image?: string
    deadline?: string
  }
}

export default function ServiceCard({ service }: ServiceCardProps) {
  // Format currency in UGX
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-blue group">
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {service.image ? (
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-blue/20 to-secondary-blue/20 flex items-center justify-center">
            <span className="text-4xl">🔧</span>
          </div>
        )}
        <Badge className="absolute top-2 right-2 bg-accent-orange text-white">
          {service.category}
        </Badge>
        <Badge className="absolute bottom-2 left-2 bg-primary-blue text-white">
          {service.division}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link href={`/rfs/${service.id}`}>
          <h3 className="font-semibold text-gray-800 hover:text-primary-blue transition-colors line-clamp-2">
            {service.title}
          </h3>
        </Link>

        <div className="mt-2 space-y-1 text-sm text-gray-600">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-primary-blue" />
            <span>{service.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-accent-orange">
              {formatCurrency(service.budget)}
            </span>
            {service.deadline && (
              <div className="flex items-center text-xs">
                <Clock className="h-3 w-3 mr-1" />
                <span>Due: {new Date(service.deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {service.provider_name && (
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            <span>{service.provider_name}</span>
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <Link href={`/rfs/${service.id}`} className="flex-1">
            <Button variant="default" className="w-full bg-primary-blue hover:bg-primary-dark">
              View Details
            </Button>
          </Link>
          <Button variant="outline" size="icon" className="border-accent-orange text-accent-orange hover:bg-accent-orange hover:text-white">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
