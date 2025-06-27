'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Transition } from 'motion/react';
import { User as UserIcon, LogOut, Share2, X, ArrowRight, Copy, Trash2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import useClickOutside from '@/hooks/useClickOutside';
import { LogIn } from 'lucide-react';

interface SharedLink {
  id: string;
  created_at: string;
}

const transition: Transition = {
  type: 'spring',
  bounce: 0.1,
  duration: 0.3,
};

export function UserActions({ user, onSignOut, onShare }: { user: User | null; onSignOut: () => void; onShare?: () => Promise<string | null> }) {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authMethod, setAuthMethod] = useState<'magic-link' | 'password'>('magic-link');
  const containerRef = useRef<HTMLDivElement>(null!);
  const [isOpen, setIsOpen] = useState(false);

  useClickOutside(containerRef, () => {
    setIsOpen(false);
    setActiveTab(null);
  });

  const handleTabClick = (tab: string) => {
    if (!isOpen) {
      setIsOpen(true);
      setActiveTab(tab);
    } else if (activeTab === tab) {
      setIsOpen(false);
      setActiveTab(null);
    } else {
      setActiveTab(tab);
    }
  };

  const handleSignIn = async () => {
    if (authMethod === 'magic-link') {
      if (!email) {
        toast.error("Please enter your email address.");
        return;
      }
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.href },
        });
        if (error) throw error;
        toast.success("Check your email for the magic link!");
      } catch (error: any) {
        toast.error(error.message || "Failed to send magic link.");
      }
    } else { // password
      if (!email || !password) {
        toast.error("Please enter both email and password.");
        return;
      }
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Successfully signed in!");
        setIsOpen(false);
        setActiveTab(null);
      } catch (error: any) {
        toast.error(error.message || "Failed to sign in.");
      }
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.href },
      });
      if (error) throw error;
      toast.success("Account created! Check your email for the confirmation link.");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up.");
    }
  };

  return (
    <motion.div ref={containerRef} className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={transition}
            className="absolute bottom-full mb-2 left-0 w-max z-50"
          >
            <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md border-[1.5px] border-indigo-200/50 dark:border-white/20 rounded-2xl shadow-lg overflow-hidden">
              <div className="p-2">
                {activeTab === 'profile' && <ProfilePanel user={user} />}
                {activeTab === 'shares' && <SharesPanel user={user} onShare={onShare} />}
                {activeTab === 'signin' && (
                  <SignInPanel
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    authMode={authMode}
                    setAuthMode={setAuthMode}
                    authMethod={authMethod}
                    setAuthMethod={setAuthMethod}
                    onSignIn={handleSignIn}
                    onSignUp={handleSignUp}
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-1 p-1.5 bg-white/80 dark:bg-black/40 backdrop-blur-md border-[1.5px] border-indigo-200/50 dark:border-white/20 rounded-2xl shadow-lg">
        {user ? (
          <>
            <button
              onClick={() => handleTabClick('profile')}
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'profile' ? 'bg-muted' : 'hover:bg-muted/50'}`}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.user_metadata.avatar_url} />
                <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium hidden sm:inline">{user.email}</span>
            </button>
            <button
              onClick={() => handleTabClick('shares')}
              className={`p-2 rounded-lg transition-colors ${activeTab === 'shares' ? 'bg-muted' : 'hover:bg-muted/50'}`}
            >
              <Share2 className="h-4 w-4" />
            </button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <button onClick={onSignOut} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <LogOut className="h-4 w-4 text-red-500" />
            </button>
          </>
        ) : (
          <button
            onClick={() => handleTabClick('signin')}
            className={`p-2 rounded-lg transition-colors ${activeTab === 'signin' ? 'bg-muted' : 'hover:bg-muted/50'}`}
          >
            <LogIn className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

function SignInPanel({
  email,
  setEmail,
  password,
  setPassword,
  authMode,
  setAuthMode,
  authMethod,
  setAuthMethod,
  onSignIn,
  onSignUp,
}: {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  authMode: 'signin' | 'signup';
  setAuthMode: (mode: 'signin' | 'signup') => void;
  authMethod: 'magic-link' | 'password';
  setAuthMethod: (method: 'magic-link' | 'password') => void;
  onSignIn: () => void;
  onSignUp: () => void;
}) {
  const isSignIn = authMode === 'signin';

  return (
    <div className="p-2 space-y-3 w-64">
      <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'signin' | 'signup')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-8">
          <TabsTrigger value="signin" className="text-xs h-6">Sign In</TabsTrigger>
          <TabsTrigger value="signup" className="text-xs h-6">Sign Up</TabsTrigger>
        </TabsList>
        
        {/* Sign In Content */}
        <TabsContent value="signin" className="mt-2">
          <Tabs value={authMethod} onValueChange={(value) => setAuthMethod(value as 'magic-link' | 'password')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-7">
              <TabsTrigger value="magic-link" className="text-xs h-5">Magic Link</TabsTrigger>
              <TabsTrigger value="password" className="text-xs h-5">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="magic-link" className="mt-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-8 text-xs"
                onKeyDown={(e) => e.key === 'Enter' && onSignIn()}
              />
            </TabsContent>
            <TabsContent value="password" className="mt-2 space-y-1">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-8 text-xs"
              />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-8 text-xs"
                onKeyDown={(e) => e.key === 'Enter' && onSignIn()}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Sign Up Content */}
        <TabsContent value="signup" className="mt-2 space-y-1">
           <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-8 text-xs"
          />
          <Input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-8 text-xs"
            onKeyDown={(e) => e.key === 'Enter' && onSignUp()}
          />
        </TabsContent>
      </Tabs>
      <Button size="sm" className="w-full" onClick={isSignIn ? onSignIn : onSignUp}>
        {isSignIn ? 'Sign In' : 'Sign Up'}
      </Button>
    </div>
  );
}

function ProfilePanel({ user }: { user: User | null }) {
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata.full_name || '');
      setAvatarUrl(user.user_metadata.avatar_url || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, avatar_url: avatarUrl }
    });

    if (error) {
      toast.error('Failed to update profile: ' + error.message);
    } else {
      toast.success('Profile updated successfully!');
      router.refresh();
    }
  };

  if (!user) return null;

  return (
    <form onSubmit={handleUpdateProfile} className="p-2 space-y-3 text-sm w-64">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs">Email</Label>
        <Input id="email" type="email" value={user.email || ''} disabled className="h-8 text-xs" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-xs">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="h-8 text-xs"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="avatarUrl" className="text-xs">Avatar URL</Label>
        <Input
          id="avatarUrl"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className="h-8 text-xs"
        />
      </div>
      <Button type="submit" size="sm" className="w-full">Save Changes</Button>
    </form>
  );
}

function SharesPanel({ user, onShare }: { user: User | null, onShare?: () => Promise<string | null> }) {
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchShares = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('shared_visualizations')
        .select('id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to fetch shared links.');
      } else {
        setSharedLinks(data as SharedLink[]);
      }
      setLoading(false);
    };
    fetchShares();
  }, [user]);

  const handleDeleteShare = async (shareId: string) => {
    const { error } = await supabase
      .from('shared_visualizations')
      .delete()
      .eq('id', shareId);

    if (error) {
      toast.error('Failed to delete share link.');
    } else {
      setSharedLinks(sharedLinks.filter(link => link.id !== shareId));
      toast.success('Share link deleted.');
    }
  };

  const copyShareLink = (url: string, isNew: boolean = false) => {
    const shareUrl = isNew ? url : `${window.location.origin}/chitra?shareId=${url}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard!");
  };

  if (loading) {
    return <div className="p-2 space-y-2 w-48">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  }

  return (
    <div className="p-2 space-y-2 w-48">
      <div className="flex justify-between items-center px-1">
        <h4 className="font-medium text-sm">My Shares</h4>
        {onShare && (
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              const url = await onShare();
              if (url) {
                copyShareLink(url, true);
              }
            }}
            className="h-7"
          >
            <Share2 className="h-3.5 w-3.5 mr-1" />
            Share
          </Button>
        )}
      </div>
      <ScrollArea className="h-48 w-full">
        {sharedLinks.length > 0 ? (
          <ul className="space-y-2 p-1">
            {sharedLinks.map((link) => (
              <li key={link.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                <div className="flex items-center gap-2 overflow-hidden">
                  <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <p className="text-xs font-mono text-primary truncate">{`...${link.id.slice(-12)}`}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyShareLink(link.id, false)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-500" onClick={() => handleDeleteShare(link.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6 text-xs text-muted-foreground">
            No shared links yet.
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
