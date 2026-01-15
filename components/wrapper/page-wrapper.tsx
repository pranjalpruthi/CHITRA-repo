import Footer from './footer'
import NavBar from './navbar'
import AntdProvider from './antd-provider'

export default function PageWrapper({ children, hideNavbar = false, hideFooter = false }: { children: React.ReactNode; hideNavbar?: boolean; hideFooter?: boolean }) {
  return (
    <AntdProvider>
      <div className="relative min-h-screen flex flex-col">
        {!hideNavbar && <NavBar />}
        <main className="flex-1 flex flex-col pt-[60px]">
          <div className="absolute z-[-99] pointer-events-none inset-0 flex items-center justify-center mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          <div className="flex-1 flex flex-col pb-8">
            {children}
          </div>
        </main>
        {!hideFooter && <Footer />}
      </div>
    </AntdProvider>
  )
}
