import Link from 'next/link'

interface CategoryCardProps {
  category: string
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/request?category=${encodeURIComponent(category)}`}
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-4 text-center border border-gray-100 hover:border-primary-blue"
    >
      <span className="text-sm font-medium text-gray-800 group-hover:text-primary-blue">
        {category}
      </span>
    </Link>
  )
}
