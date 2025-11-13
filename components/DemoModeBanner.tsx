export default function DemoModeBanner() {
  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-yellow-800 font-medium">
            <span className="font-bold">Demo Mode:</span> You're exploring with sample data
          </span>
        </div>
        <a
          href="/auth/signin"
          className="text-sm text-yellow-800 hover:text-yellow-900 underline"
        >
          Sign in for real
        </a>
      </div>
    </div>
  )
}
