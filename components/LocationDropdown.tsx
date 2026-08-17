'use client'

import { useState } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'
import { KAMPALA_LOCATIONS } from '@/lib/constants'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function LocationDropdown() {
  const [selectedDivision, setSelectedDivision] = useState('Kampala')
  const [selectedParish, setSelectedParish] = useState('')

  // Flatten all parishes for the dropdown
  const allParishes = Object.values(KAMPALA_LOCATIONS).flat()

  return (
    <div className="flex items-center space-x-2 bg-primary-dark/30 rounded-lg px-3 py-2">
      <MapPin className="h-4 w-4 text-accent-orange" />
      <Select value={selectedDivision} onValueChange={setSelectedDivision}>
        <SelectTrigger className="w-[140px] border-0 bg-transparent text-white focus:ring-0">
          <SelectValue placeholder="Select Division" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(KAMPALA_LOCATIONS).map((division) => (
            <SelectItem key={division} value={division}>
              {division}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ChevronDown className="h-3 w-3 text-gray-300" />
    </div>
  )
}
