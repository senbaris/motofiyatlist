import { Link } from 'react-router-dom'
import { Bike, Github } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <Bike className="h-6 w-6 text-primary" />
              MotoFiyatList
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Türkiye'deki tüm motosiklet markalarının güncel fiyatlarını,
              teknik özelliklerini ve fiyat geçmişini takip edin.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Hızlı Erişim</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/markalar" className="hover:text-foreground transition-colors">Tüm Markalar</Link></li>
              <li><Link to="/kategoriler" className="hover:text-foreground transition-colors">Kategoriler</Link></li>
              <li><Link to="/karsilastir" className="hover:text-foreground transition-colors">Karşılaştır</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold mb-4">Bilgi</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/hakkimizda" className="hover:text-foreground transition-colors">Hakkımızda</Link></li>
              <li><Link to="/iletisim" className="hover:text-foreground transition-colors">İletişim</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} MotoFiyatList. Tüm hakları saklıdır.
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  )
}
