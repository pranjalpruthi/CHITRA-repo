'use client'

import React, { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { Share2, Copy, Trash2, Link as LinkIcon, Eye, EyeOff } from 'lucide-react';

interface SharedLink {
  id: string;
  title: string;
  is_public: boolean;
  created_at: string;
}

interface ShareDrawerProps {
  user: User | null;
  onShare: (title: string, isPublic: boolean) => Promise<string | null>;
}

export function ShareDrawer({ user, onShare }: ShareDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);

  useEffect(() => {
    if (isOpen && user) {
      fetchSharedLinks();
    }
  }, [isOpen, user]);

  const fetchSharedLinks = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('shared_visualizations')
      .select('id, title, is_public, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch shared links.');
    } else {
      setSharedLinks(data as SharedLink[]);
    }
  };

  const handleShare = async () => {
    if (!title) {
      toast.error('Please enter a title for your shared link.');
      return;
    }
    const shareUrl = await onShare(title, isPublic);
    if (shareUrl) {
      await fetchSharedLinks();
      setTitle('');
      setIsPublic(true);
    }
  };

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/chitra/shared/${id}`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(() => {
        toast.success('Link copied to clipboard!');
      }, () => {
        toast.error('Failed to copy link. Please try again.');
      });
    } else {
      // Fallback for insecure contexts or older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';  // Prevent scrolling to bottom of page in MS Edge.
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Link copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy link.');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleDeleteLink = async (id: string) => {
    const { error } = await supabase
      .from('shared_visualizations')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete link.');
    } else {
      toast.success('Link deleted successfully.');
      fetchSharedLinks();
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    const { error } = await supabase
      .from('shared_visualizations')
      .update({ is_public: !currentVisibility })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update link visibility.');
    } else {
      toast.success('Link visibility updated.');
      fetchSharedLinks();
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon">
          <Share2 className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Share Your Visualization</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Create New Share Link</h3>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Human vs. Mouse Synteny"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="is-public" checked={isPublic} onCheckedChange={setIsPublic} />
              <Label htmlFor="is-public">Publicly accessible</Label>
            </div>
            <Button onClick={handleShare}>Share</Button>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Your Shared Links</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {sharedLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div>
                    <p className="font-semibold">{link.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(link.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleCopyLink(link.id)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleToggleVisibility(link.id, link.is_public)}>
                      {link.is_public ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteLink(link.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
