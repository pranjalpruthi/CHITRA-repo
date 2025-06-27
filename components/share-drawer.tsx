"use client"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Share2, Twitter, Facebook, Copy, Send, Link as LinkIcon, Mail, Info } from "lucide-react"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import React from 'react';
import { motion } from 'motion/react'

export function ShareDrawer({ mobile = false }) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleShare = async (platform: string) => {
    const url = window.location.href
    const title = "Check out Chitra - Chromosome Interactive Tool for Rearrangement Analysis"
    const text = "Chitra: A powerful tool for chromosome rearrangement analysis and visualization"
    const citation = `Chitra - Chromosome Interactive Tool for Rearrangement Analysis
Version: 1.0.0
URL: ${url}
Authors: [Author Names]
Repository: https://github.com/[repo]
License: Apache 2.0

Please cite this tool as:
[Authors]. (2024). Chitra: Interactive Tool for Chromosome Analysis. [DOI]`

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`, '_blank')
        break
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(title + '\n' + url)}`, '_blank')
        break
      case 'copy':
        await navigator.clipboard.writeText(citation)
        toast.success('Citation copied to clipboard!')
        break
      case 'link':
        await navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard!')
        break
    }
  }

  const trigger = mobile ? (
    <button className="relative flex flex-col items-center gap-1 p-2 transition-all text-muted-foreground hover:text-primary" onClick={() => setIsOpen(true)}>
      <div className="relative">
        <Share2 className="h-5 w-5" />
      </div>
      <span className="text-xs font-medium">Share</span>
    </button>
  ) : (
    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(true)}>
      <Share2 className="h-4 w-4" />
    </Button>
  )

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        {trigger}
      </DrawerTrigger>
      <DrawerContent className="fixed bottom-0 left-0 right-0 rounded-t-[10px] bg-background/40 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        <motion.div
          className="mx-auto w-full max-w-none md:max-w-none px-4 pb-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Handle - only show on mobile */}
          <div className="sticky top-0 flex w-full items-center justify-center bg-transparent pt-4 md:hidden">
            <div className="h-1.5 w-12 rounded-full bg-muted" />
          </div>

          <div className="h-[60vh] md:h-[50vh] overflow-y-auto overscroll-contain">
            <DrawerHeader className="mt-2">
              <DrawerTitle className="text-xl font-medium">Share Our Tool</DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground">
                Share this tool with your colleagues or on social media
              </DrawerDescription>
            </DrawerHeader>

            <div className="px-6 space-y-8">
              {/* Share Options */}
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-6">
                  <Button
                    variant="ghost"
                    className="flex flex-col items-center gap-3 h-auto py-2 hover:bg-accent/50"
                    onClick={() => handleShare('twitter')}
                  >
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-[#1DA1F2] flex items-center justify-center shadow-lg shadow-[#1DA1F2]/40"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Twitter className="h-8 w-8 text-white" />
                    </motion.div>
                    <span className="text-xs font-medium">Twitter</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex flex-col items-center gap-3 h-auto py-2 hover:bg-accent/50"
                    onClick={() => handleShare('facebook')}
                  >
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-[#4267B2] flex items-center justify-center shadow-lg shadow-[#4267B2]/40"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Facebook className="h-8 w-8 text-white" />
                    </motion.div>
                    <span className="text-xs font-medium">Facebook</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex flex-col items-center gap-3 h-auto py-2 hover:bg-accent/50"
                    onClick={() => handleShare('email')}
                  >
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-[#EA4335] flex items-center justify-center shadow-lg shadow-[#EA4335]/40"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Mail className="h-8 w-8 text-white" />
                    </motion.div>
                    <span className="text-xs font-medium">Email</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex flex-col items-center gap-3 h-auto py-2 hover:bg-accent/50"
                    onClick={() => handleShare('whatsapp')}
                  >
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/40"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Send className="h-8 w-8 text-white" />
                    </motion.div>
                    <span className="text-xs font-medium">WhatsApp</span>
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Copy Options */}
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-4 h-14 hover:bg-accent/50"
                  onClick={() => handleShare('link')}
                >
                  <motion.div
                    className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/40"
                    whileHover={{ scale: 1.1 }}
                  >
                    <LinkIcon className="h-5 w-5 text-white" />
                  </motion.div>
                  <span className="font-medium">Copy Link</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-4 h-14 hover:bg-accent/50"
                  onClick={() => handleShare('copy')}
                >
                  <motion.div
                    className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/40"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Copy className="h-5 w-5 text-white" />
                  </motion.div>
                  <span className="font-medium">Copy Citation</span>
                </Button>
              </div>

              <Separator />

              {/* Tool Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 rounded-xl bg-gray-500/10 flex items-center justify-center">
                    <Info className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">About Our Tool</p>
                    <p className="text-xs text-muted-foreground">
                      Version 1.0.0 • Apache 2.0 License • 2024
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </DrawerContent>
    </Drawer>
  )
}
