"use client"

import { motion, AnimatePresence } from "framer-motion"
import ModeToggle from '@/components/mode-toggle'
import { UserProfile } from '@/components/user-profile'
import config from '@/config'
import { ChevronRight, HomeIcon, Info, BookOpen, FileText, Copy, MoreHorizontal, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { ShinyRotatingBorderButton } from "@/components/ui/shiny-rotating-border-button"
import { AboutSheet } from "@/components/chromoviz/about"
import { GuideSheet } from "@/components/chromoviz/guide"
import { Button } from "@/components/ui/button"
import { ShareDrawer } from "@/components/share-drawer"
import { useToast } from "@/components/ui/use-toast"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const CITATION = `Pruthi, P., Narayan, J., Agarwal, P., Shukla, N., & Bhatia, A. (2024). CHITRA: Chromosome Interactive Tool for Rearrangement Analysis. CSIR-IGIB.`

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

function CopyButton() {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CITATION)
      toast.success("Citation copied to clipboard", {
        description: "You can now paste it in your document",
        duration: 2000,
      })
    } catch (err) {
      toast.error("Failed to copy citation", {
        description: "Please try again or copy manually",
        duration: 2000,
      })
    }
  }

  return (
    <Button 
      variant="ghost" 
      className="h-8 w-8 sm:w-auto hover:bg-background/80 text-sm p-0 sm:p-2"
      onClick={handleCopy}
      data-copy-button="true"
    >
      <Copy className="h-4 w-4" />
      <span className="hidden sm:inline-block sm:ml-2">Cite</span>
    </Button>
  )
}

function NavButton({ href, icon: Icon, children }: { href: string; icon: any; children: React.ReactNode }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setIsLoading(true)
    router.push(href)
  }

  return (
    <Link href={href} onClick={handleClick}>
      <Button 
        variant="ghost" 
        className="h-8 w-auto hover:bg-background/80 text-sm p-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
        <span className="ml-2">{children}</span>
      </Button>
    </Link>
  )
}

function NavActions() {
  return (
    <>
      {/* Desktop view */}
      <div className="hidden sm:flex items-center gap-2">
        <AboutSheet>
          <Button 
            variant="ghost" 
            className="h-8 w-auto hover:bg-background/80 text-sm p-2"
          >
            <Info className="h-4 w-4" />
            <span className="ml-2">About</span>
          </Button>
        </AboutSheet>
        <GuideSheet>
          <Button 
            variant="ghost" 
            className="h-8 w-auto hover:bg-background/80 text-sm p-2"
          >
            <BookOpen className="h-4 w-4" />
            <span className="ml-2">Guide</span>
          </Button>
        </GuideSheet>
        <NavButton href="/docs" icon={FileText}>
          Docs
        </NavButton>
        <CopyButton />
      </div>

      {/* Mobile view */}
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0 hover:bg-background/80"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <AboutSheet>
              <DropdownMenuItem>
                <Info className="h-4 w-4 mr-2" />
                About
              </DropdownMenuItem>
            </AboutSheet>
            <GuideSheet>
              <DropdownMenuItem>
                <BookOpen className="h-4 w-4 mr-2" />
                Guide
              </DropdownMenuItem>
            </GuideSheet>
            <Link 
              href="/docs" 
              onClick={(e) => {
                e.preventDefault()
                const router = useRouter()
                router.push('/docs')
              }}
            >
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Docs
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={() => {
              const copyButton = document.querySelector('[data-copy-button="true"]') as HTMLButtonElement;
              copyButton?.click();
            }}>
              <Copy className="h-4 w-4 mr-2" />
              Cite
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setIsScrolled(scrollTop > 10)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.div 
      className="fixed top-0 left-0 right-0 z-50 h-[60px]"
      layout
    >
      <motion.header 
        layout
        className={clsx(
          "w-full h-full relative",
          isHomePage && [
            isScrolled
              ? "max-w-2xl mx-auto px-2 sm:px-4"
              : "w-full px-4 sm:px-8",
            "rounded-full",
            isScrolled 
              ? "bg-background/40 backdrop-blur-[16px] brightness-[1.1] border border-white/[0.1] dark:border-white/[0.05]"
              : "bg-background/30 backdrop-blur-[16px]"
          ],
          !isHomePage && [
            isScrolled 
              ? "bg-background/40 backdrop-blur-[16px] brightness-[1.1] border-b border-white/[0.1] dark:border-white/[0.05]"
              : "bg-background/30 backdrop-blur-[16px]"
          ]
        )}
      >
        {/* Glass edge with animation */}
        <motion.div 
          layout
          className={clsx(
            "absolute inset-x-0 -bottom-[1px] h-[1px]",
            "bg-gradient-to-r from-transparent via-white/[0.15] to-transparent",
            "backdrop-blur-[8px]",
            isHomePage && "rounded-full"
          )} 
        />

        <motion.div 
          layout
          className={clsx(
            "flex items-center justify-between",
            isHomePage && !isScrolled
              ? "h-20 px-6 sm:px-8 max-w-7xl mx-auto"
              : "h-14 lg:h-[55px] px-2 sm:px-4 md:px-6 lg:px-8"
          )}
        >
          {/* Left side - Logo and Title */}
          <motion.div 
            layout
            className="flex items-center gap-2 sm:gap-4"
          >
            <Link href="/">
              <ShinyRotatingBorderButton className={clsx(
                "!p-1 sm:!p-1.5 !px-2 sm:!px-3",
                isHomePage && "!border-0"
              )}>
                <span className="text-xs sm:text-sm font-bold tracking-tight">CHITRA</span>
              </ShinyRotatingBorderButton>
            </Link>
            <NavActions />
          </motion.div>

          {/* Right side content */}
          <motion.div 
            layout
            className="flex items-center gap-2 sm:gap-4"
          >
            <div className={clsx(
              "hidden md:block",
              isHomePage && "hidden"
            )}>
              <Breadcrumbs />
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {config?.auth?.enabled && (
                <UserProfile />
              )}
              <ShareDrawer />
              <ModeToggle />
            </div>
          </motion.div>
        </motion.div>
      </motion.header>
    </motion.div>
  )
}
