import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-5xl font-bold text-foreground">
          MotoFiyatList.com
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Türkiye'deki tüm motosiklet fiyatlarını tek platformda takip edin
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg">Motosikletleri Keşfet</Button>
          <Button size="lg" variant="outline">Fiyat Karşılaştır</Button>
        </div>
        <div className="pt-8 text-sm text-muted-foreground">
          <p>✅ Vite + React + TypeScript</p>
          <p>✅ Tailwind CSS + shadcn/ui</p>
          <p>✅ Supabase Database Schema</p>
          <p>✅ React Router</p>
        </div>
      </div>
    </div>
  )
}
