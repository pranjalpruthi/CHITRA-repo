"use client"

import ModeToggle from '@/components/mode-toggle'
import { UserProfile } from '@/components/user-profile'
import config from '@/config'
import { ChevronRight, HomeIcon, Info, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { ShinyRotatingBorderButton } from "@/components/ui/shiny-rotating-border-button"
import { AboutSheet } from "@/components/chromoviz/about"
import { GuideSheet } from "@/components/chromoviz/guide"
import { Button } from "@/components/ui/button"
import { ShareDrawer } from "@/components/share-drawer"

function Breadcrumbs() {
  const pathname = usePathname()
  const paths = pathname.split('/').filter(Boolean)
  
  return (
    <div className="flex items-center gap-1 text-sm text-gray-500">
      <Link href="/" className="hover:text-gray-900 dark:hover:text-gray-50">
        <HomeIcon className="h-4 w-4" />
      </Link>
      {paths.map((path, index) => {
        const href = `/${paths.slice(0, index + 1).join('/')}`
        const isLast = index === paths.length - 1
        
        return (
          <div key={path} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link
              href={href}
              className={clsx(
                "capitalize hover:text-gray-900 dark:hover:text-gray-50",
                { "text-gray-900 dark:text-gray-50": isLast }
              )}
            >
              {path}
            </Link>
          </div>
        )
      })}
    </div>
  )
}

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setIsScrolled(scrollTop > 10)
    }

    // Initial check
    handleScroll()
    
    // Add event listener
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="sticky top-0 z-40">
      <header 
        className={clsx(
          "w-full transition-all duration-200",
          {
            "border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm": isScrolled,
            "bg-background": !isScrolled
          }
        )}
      >
        <div className="flex h-14 lg:h-[55px] items-center justify-between px-4 md:px-6 lg:px-8">
          {/* Left side - Logo and Title */}
          <div className="flex items-center gap-4">
            <ShinyRotatingBorderButton className="!p-1.5 !px-3">
              <span className="text-sm font-bold tracking-tight">CHITRA</span>
            </ShinyRotatingBorderButton>
            <p className="text-sm text-muted-foreground hidden md:block">
              Chromosome Interactive Tool for Rearrangement Analysis
            </p>
          </div>

          {/* Right side - Breadcrumbs, Info, Guide, Share, User Profile, and Dark Mode */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <Breadcrumbs />
            </div>
            <div className="flex items-center gap-2">
              <AboutSheet>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4" />
                </Button>
              </AboutSheet>
              <GuideSheet>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <BookOpen className="h-4 w-4" />
                </Button>
              </GuideSheet>
              {config?.auth?.enabled && <div className="hidden md:block"><UserProfile /></div>}
              <div className="hidden md:block">
                <ShareDrawer />
              </div>
              <ModeToggle />
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}
