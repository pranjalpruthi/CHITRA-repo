"use client"

import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { HomeIcon, Info, BookOpen, Settings, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import clsx from "clsx"
import { AboutSheet } from "@/components/chromoviz/about"
import { GuideSheet } from "@/components/chromoviz/guide"
import { ShareDrawer } from "@/components/share-drawer"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ShinyRotatingBorderButton } from "@/components/ui/shiny-rotating-border-button"

interface NavItem {
  title: string
  icon: any
  href: string
  items?: { title: string; href: string }[]
}

const analysisItems: NavItem[] = [
  {
    title: "Analysis",
    icon: HomeIcon,
    href: "/analysis",
    items: [
      { title: "ChromoViz", href: "/chromoviz" },
      { title: "Results", href: "/results" }
    ]
  }
]

const renderNavItem = (item: NavItem, isCollapsed: boolean, pathname: string) => {
  const isActive = pathname.startsWith(item.href)
  const hasActiveChild = item.items?.some(subItem => pathname === subItem.href)

  return (
    <Collapsible key={item.title} defaultOpen={isActive && !isCollapsed}>
      <CollapsibleTrigger className="w-full">
        <div className={clsx(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
          {
            "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50": isActive || hasActiveChild,
            "justify-center": isCollapsed
          }
        )}>
          <item.icon className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && (
            <>
              <span>{item.title}</span>
              <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
            </>
          )}
        </div>
      </CollapsibleTrigger>
      
      {item.items && !isCollapsed && (
        <CollapsibleContent>
          <div className="ml-6 mt-1 flex flex-col gap-1">
            {item.items.map((subItem) => (
              <Link
                key={subItem.href}
                href={subItem.href}
                className={clsx(
                  "rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                  { "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50": pathname === subItem.href }
                )}
              >
                {subItem.title}
              </Link>
            ))}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isGuideSheetOpen, setIsGuideSheetOpen] = useState(false)

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsCollapsed(false)
    }
  }

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsCollapsed(true)
    }
  }

  const sidebarContent = (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className={clsx(
        "flex h-[55px] items-center border-b w-full",
        { "justify-center px-2": isCollapsed, "px-4": !isCollapsed }
      )}>
        <Link href="/">
          <ShinyRotatingBorderButton className={clsx(
            "transition-all duration-300",
            !isCollapsed ? "w-full p-1.5 px-3" : "w-8 h-8 p-0"
          )}>
            <span className={clsx(
              "font-bold tracking-tight transition-all duration-300",
              !isCollapsed ? "text-lg" : "text-sm"
            )}>
              {!isCollapsed ? "CHITRA" : "C"}
            </span>
          </ShinyRotatingBorderButton>
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <nav className={clsx(
          "grid items-start text-sm font-medium gap-1",
          { "px-2": isCollapsed, "px-4": !isCollapsed }
        )}>
          <Link
            href="/"
            className={clsx(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
              {
                "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50": pathname === "/",
                "justify-center": isCollapsed
              }
            )}
          >
            <HomeIcon className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Home</span>}
          </Link>
          
          <Separator className="my-2" />
          
          {analysisItems.map(item => renderNavItem(item, isCollapsed, pathname))}
        </nav>
      </div>

      <div className="border-t p-4">
        <div className="flex flex-col gap-2">
          <AboutSheet>
            <Button
              variant="ghost"
              className={clsx(
                "w-full flex items-center gap-2",
                { "justify-center": isCollapsed }
              )}
            >
              <Info className="h-4 w-4" />
              {!isCollapsed && <span>About</span>}
            </Button>
          </AboutSheet>
          <Button
            variant="ghost"
            className={clsx(
              "w-full flex items-center gap-2",
              { "justify-center": isCollapsed }
            )}
            onClick={() => setIsGuideSheetOpen(true)}
          >
            <BookOpen className="h-4 w-4" />
            {!isCollapsed && <span>Guide</span>}
          </Button>
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <>
        <nav className="fixed bottom-0 left-0 z-50 w-full border-t bg-background/80 backdrop-blur-lg backdrop-saturate-150 supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-around h-16 px-4">
            <Link
              href="/"
              className={clsx(
                "relative flex flex-col items-center gap-1 p-2 transition-all",
                {
                  "text-primary after:absolute after:bottom-0 after:left-1/2 after:h-1 after:w-8 after:-translate-x-1/2 after:rounded-full after:bg-primary after:content-['']": pathname === "/",
                  "text-muted-foreground hover:text-primary": pathname !== "/"
                }
              )}
            >
              <div className="relative">
                <HomeIcon className="h-5 w-5" />
                {pathname === "/" && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-xs font-medium">Home</span>
            </Link>

            <AboutSheet>
              <button
                className={clsx(
                  "relative flex flex-col items-center gap-1 p-2 transition-all",
                  {
                    "text-muted-foreground hover:text-primary": true
                  }
                )}
              >
                <div className="relative">
                  <Info className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">About</span>
              </button>
            </AboutSheet>

            <button
              className={clsx(
                "relative flex flex-col items-center gap-1 p-2 transition-all",
                {
                  "text-muted-foreground hover:text-primary": true
                }
              )}
              onClick={() => setIsGuideSheetOpen(true)}
            >
              <div className="relative">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">Guide</span>
            </button>

            <ShareDrawer mobile />
          </div>
        </nav>
        <GuideSheet open={isGuideSheetOpen} onOpenChange={setIsGuideSheetOpen} />
      </>
    )
  }

  return (
    <>
      <div
        className={clsx(
          "fixed left-0 top-0 h-screen z-50",
          "hidden md:block",
          "transition-all duration-300",
          "border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          { "w-[70px]": isCollapsed, "w-[280px]": !isCollapsed }
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {sidebarContent}
      </div>
      <GuideSheet open={isGuideSheetOpen} onOpenChange={setIsGuideSheetOpen} />
    </>
  )
}
