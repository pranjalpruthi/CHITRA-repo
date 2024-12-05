"use client"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Share2, Twitter, Facebook, Copy, Send } from "lucide-react"
import { toast } from "sonner"

export function SharePopover() {
  const handleShare = async (platform: string) => {
    const url = window.location.href
    const title = "Check out Chitra - Chromosome Interactive Tool for Rearrangement Analysis"
    const text = "Chitra: A powerful tool for chromosome rearrangement analysis and visualization"
    const citation = `Chitra - Chromosome Interactive Tool for Rearrangement Analysis\nURL: ${url}`

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(title + '\n' + url)}`, '_blank')
        break
      case 'copy':
        await navigator.clipboard.writeText(citation)
        toast.success('Citation copied to clipboard!')
        break
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Share2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end">
        <div className="grid gap-2">
          <h4 className="font-medium leading-none mb-2">Share</h4>
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={() => handleShare('twitter')}
          >
            <Twitter className="mr-2 h-4 w-4" />
            Twitter
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => handleShare('facebook')}
          >
            <Facebook className="mr-2 h-4 w-4" />
            Facebook
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => handleShare('whatsapp')}
          >
            <Send className="mr-2 h-4 w-4" />
            WhatsApp
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => handleShare('copy')}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Citation
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
