"use client"
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t dark:bg-black">
            <div className="mx-auto max-w-screen-xl px-4 py-8">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                    <div>
                        <p className="font-medium">About CHITRA</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            CHromosome Interactive Tool for Rearrangement Analysis
                        </p>
                        <ul className="mt-6 space-y-4 text-sm">
                            <li>
                                <Link href="/about" className="transition hover:opacity-75">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/methodology" className="transition hover:opacity-75">
                                    Methodology
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="font-medium">Resources</p>
                        <ul className="mt-6 space-y-4 text-sm">
                            <li>
                                <Link href="/docs" className="transition hover:opacity-75">
                                    Documentation
                                </Link>
                            </li>
                            <li>
                                <Link href="/examples" className="transition hover:opacity-75">
                                    Example Data
                                </Link>
                            </li>
                            <li>
                                <Link href="/api" className="transition hover:opacity-75">
                                    API
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="font-medium">Connect</p>
                        <ul className="mt-6 space-y-4 text-sm">
                            <li>
                                <a href="https://github.com/your-repo/chromoviz" target="_blank" rel="noopener noreferrer" className="transition hover:opacity-75">
                                    GitHub
                                </a>
                            </li>
                            <li>
                                <a href="mailto:support@chromoviz.com" className="transition hover:opacity-75">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 border-t pt-8">
                    <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-between sm:items-center">
                        <p className="text-xs text-muted-foreground">
                            &copy; {new Date().getFullYear()} CHITRA. All rights reserved.
                        </p>
                        <ul className="flex flex-wrap gap-4 text-xs">
                            <li>
                                <Link href="/terms" className="transition hover:opacity-75">
                                    Terms
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="transition hover:opacity-75">
                                    Privacy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    )
}
