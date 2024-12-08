import Footer from './footer'
import NavBar from './navbar'

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <NavBar />
      <main className="flex-1">
        <div className="absolute z-[-99] pointer-events-none inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        {children}
        <Footer />
      </main>
    </div>
  )
}