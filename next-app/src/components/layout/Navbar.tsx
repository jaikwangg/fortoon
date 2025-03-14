'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, LogOut, Settings, User as UserIcon, Sun, Moon, Menu, Users, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; 
import { useSettings } from '@/contexts/SettingsContext';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { CldImage } from 'next-cloudinary';

export default function Navbar() {
  const { user, signOut } = useAuth(); 
  const { theme, setTheme } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const applyTheme = (themeToApply: 'light' | 'dark') => {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(themeToApply);
    };

    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch('/api/payment/coin', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch balance');
        const data = await response.json();
        setBalance(data.data.balance);
      } catch (error) {
        console.error('Error fetching balance:', error);
        toast({
          title: "Error",
          description: "Failed to fetch current balance",
          variant: "destructive",
        });
      }
    };

    if (user) {
      fetchBalance();
    }
  }, [toast, user]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const getThemeIcon = () => {
    return theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />;
  };

  const toggleSearch = () => {
    setSearchOpen(!isSearchOpen);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchQuery(newSearchTerm);

    if (newSearchTerm.trim()) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/story', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch stories');
        }

        const data = await response.json();
        const filteredResults = data.data.filter((story: any) => 
          story.title.toLowerCase().includes(newSearchTerm.toLowerCase())
        );
        setSearchResults(filteredResults);
        router.push(`/search?q=${encodeURIComponent(newSearchTerm)}`);
      } catch (error) {
        console.error('Error fetching stories:', error);
        toast({
          title: "Error",
          description: "Failed to fetch stories",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearchResults([]);
      router.push('/');
    }
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section: Logo and Search Icon */}
          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button className="flex items-center">
                <span className="text-xl font-bold">Fortoon</span>
                {/* <img src="/logo.svg" alt="Manga App Logo" className="h-8 w-8" /> */}
                <div className="relative h-12 w-12">
                  <Image 
                    src="/logo.svg" 
                    alt="Manga App Logo" 
                    fill 
                    className="object-contain" 
                  />
                </div>
              </Button>
            </Link>
          </div>

          {/* Middle Section: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl px-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search manga..."
                className={`w-full pl-10 ${isLoading ? 'opacity-50' : ''}`}
                value={searchQuery}
                onChange={handleSearch}
                disabled={isLoading}
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search Icon */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSearch}>
            <Search className="h-6 w-6" />
          </Button>

          {/* Right Section: User Info and Menu */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
              {getThemeIcon()}
            </Button>
            
            {/* User Info and Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    {/* <UserAvatar user={user} size="sm" /> */}
                    <div className="text-left">
                      <div className="font-medium">{user?.username}</div>
                      <div className="text-xs text-muted-foreground">coins: {balance}</div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link href="/profile" className="flex items-center">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/community" className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Community
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/topup" className="flex items-center">
                      <Wallet className="mr-2 h-4 w-4" />
                      Topup
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Register</Button>
                </Link>
              </div>
            )}

            {/* Menu Icon (shows on small screens) */}
            <Button className="md:hidden" onClick={toggleSidebar}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Full-Screen Search for Mobile */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 p-4">
          <div className="relative">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={toggleSearch}>
              X
            </Button>
            <Input
              type="search"
              placeholder="Search manga..."
              className={`w-full ${isLoading ? 'opacity-50' : ''}`}
              value={searchQuery}
              onChange={handleSearch}
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sidebar for right-side menu */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50">
          <div className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-gray-800 p-4 text-gray-900 dark:text-white">
            <Button className="mb-4" onClick={toggleSidebar}>Close</Button>
            <nav>
              <ul>
                {user ? (
                  <>
                    <li className="mb-4 flex items-center space-x-3">
                      <div className="relative h-12 w-12 rounded-full overflow-hidden">
                        {user.profilePicUrl ? (
                          <CldImage
                            src={user.profilePicUrl}
                            alt={`${user.username}'s profile`}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{user?.username}</div>
                        <div className="text-sm text-muted-foreground">Credits: {balance}</div>
                      </div>
                    </li>
                    <li><Link href="/profile" className="block py-2">Profile</Link></li>
                    <li><Link href="/community" className="block py-2">community</Link></li>
                    <li><Link href="/topup" className="block py-2">topup</Link></li>
                    <li><Link href="/settings" className="block py-2">Settings</Link></li>
                    <li><Button onClick={signOut} className="mt-4">Sign Out</Button></li>
                  </>
                ) : (
                  <>
                    <li><Link href="/login" className="block py-2">Login</Link></li>
                    <li><Link href="/register" className="block py-2">Register</Link></li>
                  </>
                )}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </nav>
  );
}