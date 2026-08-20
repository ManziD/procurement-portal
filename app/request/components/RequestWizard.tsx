'use client'

import { useState } from 'react'

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

  // Step 2: Service description
  if (step === 'description') {
    return (
      <div>
        <h1 className="text-2xl font-bold text-primary-blue mb-6">Describe your service need</h1>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              What do you need help with?
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the service you need in detail..."
              className="w-full border rounded-lg px-4 py-3 h-32 focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          <div>
            <label htmlFor="timeline" className="block text-sm font-medium mb-1">
              When do you need it?
            </label>
            <select
              id="timeline"
              value={formData.timeline}
              onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value="">Select timeline</option>
              <option value="ASAP">ASAP</option>
              <option value="Today">Today</option>
              <option value="Tomorrow">Tomorrow</option>
              <option value="This Week">This Week</option>
              <option value="Next Week">Next Week</option>
            </select>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep('category')}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep('location')}
              disabled={!formData.description || !formData.timeline}
              className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Placeholder for remaining steps
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-semibold">Step: {step}</h2>
      <p className="text-gray-500 mt-2">Coming soon...</p>
    </div>
  )
}
