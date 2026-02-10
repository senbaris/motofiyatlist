import { Link } from 'react-router-dom'
import { Bike, Search, Menu, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Bike className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">MotoFiyatList</span>
          <span className="sm:hidden">MFL</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Ana Sayfa
          </Link>
          <Link to="/markalar" className="text-sm font-medium hover:text-primary transition-colors">
            Markalar
          </Link>
          <Link to="/kategoriler" className="text-sm font-medium hover:text-primary transition-colors">
            Kategoriler
          </Link>
          <Link to="/karsilastir" className="text-sm font-medium hover:text-primary transition-colors">
            Karşılaştır
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-5 w-5" />
          </Button>
          <Link to="/admin">
            <Button variant="ghost" size="icon" title="Admin Panel">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
