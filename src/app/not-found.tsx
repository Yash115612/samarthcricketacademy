import Link from 'next/link'
import { Trophy } from 'lucide-react'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-academy-dark flex flex-col items-center justify-center text-center px-6">
      <div className="relative w-20 h-20 mb-8 animate-bounce">
        <Image
          src="/logo.png"
          alt="Samarth Cricket Academy Logo"
          fill
          className="object-contain"
        />
      </div>
      <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tighter">404</h1>
      <h2 className="text-2xl md:text-4xl font-black text-academy-gold uppercase tracking-tight mb-8">Out of Bounds</h2>
      <p className="text-gray-400 max-w-md mb-12 font-medium text-lg">
        The page you are looking for has been moved or doesn&apos;t exist. Let&apos;s get you back on the field.
      </p>
      <Link 
        href="/"
        className="px-8 py-4 bg-academy-red text-white rounded-xl font-black uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-2xl shadow-academy-red/20"
      >
        Back to Home
      </Link>
    </div>
  )
}
