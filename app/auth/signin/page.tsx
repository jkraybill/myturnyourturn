'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard'
  const [loadingDemo, setLoadingDemo] = useState(false)

  const handleDemoMode = async () => {
    setLoadingDemo(true)
    try {
      const response = await fetch('/api/demo/start', {
        method: 'POST',
      })

      if (!response.ok) {
        alert('Failed to start demo mode')
        setLoadingDemo(false)
        return
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      alert('Failed to start demo mode')
      setLoadingDemo(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-british-racing-green mb-2">
            MyTurnYourTurn
          </h1>
          <p className="text-gray-600 mb-8">
            Track whose turn it is to pay
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => signIn('google', { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-lg font-medium"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => signIn('facebook', { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-lg font-medium"
          >
            <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continue with Facebook
          </button>

          <button
            onClick={() => signIn('apple', { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors text-lg font-medium"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Continue with Apple
          </button>
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">Or try it out</span>
          </div>
        </div>

        <button
          onClick={handleDemoMode}
          disabled={loadingDemo}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors text-lg font-medium disabled:opacity-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {loadingDemo ? 'Starting Demo...' : 'Try Demo Mode'}
        </button>

        <p className="text-sm text-gray-500 text-center mt-4">
          Demo mode lets you explore the app with sample data - no login required!
        </p>

        <p className="text-sm text-gray-500 text-center mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
