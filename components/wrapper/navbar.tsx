"use client"
import Link from 'next/link';
import * as React from "react";
import { Button } from "../ui/button";
import { UserProfile } from "../user-profile";
import ModeToggle from "../mode-toggle";
import { 
    Home,
    LayoutDashboard, 
    Menu, 
    LineChart,
    Info
} from "lucide-react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import config from "@/config";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { ShinyRotatingBorderButton } from "@/components/ui/shiny-rotating-border-button";
import { usePathname } from 'next/navigation';
import { AboutSheet } from "@/components/chromoviz/about";

const components: { title: string; href: string; description: string }[] = [
    {
        title: "Marketing Page",
        href: "/marketing-page",
        description: "Write some wavy here to get them to click.",
    },
    {
        title: "ChromoViz",
        href: "/chromoviz",
        description: "Visualize your chromatic data with ChromoViz.",
    },
];

// Mobile navigation items
const mobileNavItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: LineChart, label: 'ChromoViz', href: '/chromoviz' },
    { icon: Info, label: 'About', component: AboutSheet },
];

function NavBarContent({ userId }: { userId?: string | null }) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="min-[825px]:hidden fixed top-0 left-0 right-0 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 z-50">
                <div className="flex items-center justify-between px-4 h-14">
                    <ShinyRotatingBorderButton className="!p-1 !px-2">
                        <span className="text-sm font-bold tracking-tight">CHITRA</span>
                    </ShinyRotatingBorderButton>
                    <ModeToggle />
                </div>
            </div>

            {/* Desktop Navbar */}
            <div className="hidden min-[825px]:flex min-w-full fixed p-2 border-b z-10 backdrop-blur-md bg-background/60 supports-[backdrop-filter]:bg-background/60">
                {/* Logo Section - Left */}
                <div className="flex-none flex items-center gap-4 pl-4">
                    <ShinyRotatingBorderButton className="!p-1.5 !px-3">
                        <span className="text-lg font-bold tracking-tight">CHITRA</span>
                    </ShinyRotatingBorderButton>
                    <p className="text-sm text-muted-foreground hidden xl:block">
                        CHromosome Interactive Tool for Rearrangement Analysis
                    </p>
                </div>

                {/* Navigation Items - Center */}
                <div className="flex-1 flex items-center justify-center">
                    <NavigationMenu>
                        <NavigationMenuList className="flex items-center gap-2">
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50 h-9">
                                    Features
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="flex flex-col w-[400px] gap-3 p-4 lg:w-[500px] bg-popover/80 backdrop-blur-sm">
                                        {components.map((component) => (
                                            <ListItem
                                                key={component.title}
                                                title={component.title}
                                                href={component.href}
                                            >
                                                {component.description}
                                            </ListItem>
                                        ))}
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href="/dashboard" legacyBehavior passHref>
                                    <Button variant="ghost" className="hover:bg-accent/50 h-9">Dashboard</Button>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href="/chromoviz" legacyBehavior passHref>
                                    <Button variant="ghost" className="hover:bg-accent/50 h-9">ChromoViz</Button>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href="/c2" legacyBehavior passHref>
                                    <Button variant="ghost" className="hover:bg-accent/50 h-9">C2</Button>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <AboutSheet />
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* User Profile and Theme Toggle - Right */}
                <div className="flex-none flex items-center gap-2 pr-4">
                    {userId && <UserProfile />}
                    <ModeToggle />
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="min-[825px]:hidden fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 z-50">
                <nav className="flex justify-around items-center h-16 px-4">
                    {mobileNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        if (item.component) {
                            const Component = item.component;
                            return (
                                <div key="about" className="flex flex-col items-center justify-center gap-1">
                                    <Component>
                                        <button className="flex flex-col items-center text-muted-foreground">
                                            <Icon className="h-5 w-5" />
                                            <span className="text-xs font-medium">
                                                {item.label}
                                            </span>
                                        </button>
                                    </Component>
                                </div>
                            );
                        }
                        return (
                            <Link 
                                key={item.href} 
                                href={item.href}
                                className="flex flex-col items-center justify-center gap-1"
                            >
                                <div className={cn(
                                    "flex flex-col items-center transition-colors",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                )}>
                                    <Icon className="h-5 w-5" />
                                    <span className="text-xs font-medium">
                                        {item.label}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}

const AuthenticatedNav = () => {
    const { userId } = useAuth();
    return <NavBarContent userId={userId} />;
};

// Main export that conditionally renders based on config
export default function NavBar() {
    if (config?.auth?.enabled) {
        return <AuthenticatedNav />;
    }
    return <NavBarContent userId={null} />;
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = "ListItem";
