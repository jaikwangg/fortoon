import { Quicksand } from "next/font/google";
import Link from "next/link";
import Image from "next/image";

// const quicksand = Quicksand({ subsets: ["latin"] });

export function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="h-20 container flex items-center justify-between">
                {/* Logo Section */}
                <Link
                    href="/"
                    className="flex items-center gap-2 transition-transform hover:scale-105"
                >
                    <Image
                        src="/logo.png"
                        alt="Fortoon"
                        width={120}
                        height={48}
                        className="h-12 w-auto"
                    />
                </Link>

                {/* Search Section */}
                {/* <div className="flex-1 max-w-xl px-6">
                    <div className="relative">
                        <input
                            type="search"
                            placeholder="Search manga..."
                            className="w-full px-4 py-2.5 rounded-full bg-muted/50 
                border border-border/50 
                focus:outline-none focus:ring-2 focus:ring-primary/20
                transition-all duration-300"
                        />
                    </div>
                </div> */}

                {/* Actions Section */}
                <div className="flex items-center gap-4">
                    {/* <ModeToggle /> */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center">
                            <span>coins: 20</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>yone</span>
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-border/50">
                                <Image 
                                    src="/default-avatar.png" // Replace with actual avatar image path
                                    alt="Profile"
                                    width={32}
                                    height={32}
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}