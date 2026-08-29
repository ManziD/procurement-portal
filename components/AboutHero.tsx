export default function AboutHero() {
  return (
    <div className="bg-gradient-to-r from-primary-blue to-secondary-blue text-white">
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          When you need it,
          <br />
          ServiceHub{' '}
          <span className="inline-block bg-accent-orange text-white px-3 py-1 rounded-full">
            connects
          </span>{' '}
          you instantly
        </h1>

        <p className="text-lg text-blue-100 mb-10 max-w-xl mx-auto">
          Post a request or search for a service, and get matched with verified
          providers across Kampala — plumbers, electricians, IT technicians, and
          more.
        </p>

        {/* Floating product mockup card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 text-left max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium bg-white/15 rounded-full px-3 py-1">
              Verified Provider
            </span>
            <span className="text-xs font-medium bg-white/15 rounded-full px-3 py-1">
              Plumbing
            </span>
          </div>

          <p className="text-blue-50 leading-relaxed mb-5">
            ServiceHub is a marketplace connecting clients with trusted service
            providers in Kampala — post what you need, compare verified
            professionals, and get it done.
          </p>

          <div className="flex items-center bg-white rounded-lg overflow-hidden">
            <span className="flex-1 px-4 py-2 text-gray-400 text-sm">
              Search for services...
            </span>
            <span className="bg-accent-orange px-4 py-2 text-white">→</span>
          </div>
        </div>
      </div>
    </div>
  )
}
