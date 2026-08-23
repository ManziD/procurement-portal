{profile?.role === 'CLIENT' && (
  <>
    <Link
      href="/client/request"
      className="flex items-center space-x-3 text-white hover:text-accent-orange transition-colors py-2 border-b border-white/10"
      onClick={() => setIsMenuOpen(false)}
    >
      <FileText className="h-5 w-5" />
      <span>Post Request</span>
    </Link>
    <Link
      href="/client/inbox"
      className="flex items-center space-x-3 text-white hover:text-accent-orange transition-colors py-2 border-b border-white/10"
      onClick={() => setIsMenuOpen(false)}
    >
      <MessageCircle className="h-5 w-5" />
      <span>Inbox</span>
    </Link>
  </>
)}
