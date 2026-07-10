import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  MapPin, 
  FileText, 
  MessageSquare, 
  Calendar, 
  Image as ImageIcon, 
  Home, 
  Settings,
  LogOut,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/properties', label: 'Properties', icon: MapPin },
  { href: '/admin/articles', label: 'Articles', icon: FileText },
  { href: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
  { href: '/admin/site-visits', label: 'Site Visits', icon: Calendar },
  { href: '/admin/media', label: 'Media Library', icon: ImageIcon },
  { href: '/admin/homepage', label: 'Homepage', icon: Home },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      <button 
        onClick={toggleMenu}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar text-sidebar-foreground rounded-md shadow-md"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Link href="/admin">
            <span className="font-heading font-bold text-xl tracking-tight text-white uppercase flex items-center gap-2">
              <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center text-primary font-bold">E</div>
              EWAMA Admin
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = location === item.href || (location.startsWith(item.href) && item.href !== '/admin');
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer",
                  isActive 
                    ? "bg-secondary text-secondary-foreground font-medium" 
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/80"
                )}>
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md w-full text-left hover:bg-sidebar-accent text-sidebar-foreground/80 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
