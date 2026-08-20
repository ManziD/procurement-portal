'use client'

import { useState } from 'react'
import { CATEGORIES } from '@/lib/constants'
import { CategoryCard } from '@/components/ui/category-card' // we might need to create a simple one

interface Category {
  id: string
  name: string
  icon: string | null
}

interface RequestWizardProps {
  categories: Category[]
}

type Step = 'category' | 'description' | 'location' | 'providers' | 'select-providers' | 'phone' | 'verify' | 'confirm'

export default function RequestWizard({ categories }: RequestWizardProps) {
  const [step, setStep] = useState<Step>('category')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    description: '',
    timeline: '',
    division: '',
    parish: '',
    providers: [] as string[],
    phone: '',
    name: '',
    verificationCode: '',
  })

  // Step 1: Category selection
  if (step === 'category') {
    return (
      <div>
        <h1 className="text-2xl font-bold text-primary-blue mb-6">What service do you need?</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id)
                setStep('description')
              }}
              className="p-4 border rounded-lg hover:border-primary-blue hover:shadow-md transition-all text-center"
            >
              <div className="text-3xl mb-2">{cat.icon || '🔧'}</div>
              <div className="font-medium">{cat.name}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Other steps will be added later
  return (
    <div>
      <h2>Step: {step}</h2>
      <p>Coming soon...</p>
    </div>
  )
}
