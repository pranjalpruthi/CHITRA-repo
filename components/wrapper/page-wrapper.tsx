import Footer from './footer'
import NavBar from './navbar'

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 flex flex-col pt-[60px]">
        <div className="absolute z-[-99] pointer-events-none inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="flex-1 flex flex-col pb-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}