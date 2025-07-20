import React, { useState } from 'react';
import {
  X, Home, Users, BarChart3, Settings, LogOut, ChevronDown, Moon, Sun, Palette, Bell, Search, Plus, TrendingUp, Activity, Shield, Zap, Eye, EyeOff, Boxes, ShoppingCart, UserCheck, BarChart2, Cpu, Layers, Package, Warehouse, ShieldCheck, UsersRound
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme, themesConfig } from './ui/GlobalUI';
import ThemedButton from './ui/ThemedButton';

const menuItems = [
  { icon: Home, label: 'Dashboard', to: '/dashboard' },
  { icon: Users, label: 'Users', to: '/users' },
  { icon: Cpu, label: 'Machines', to: '/machines' },
  { icon: Layers, label: 'Molds', to: '/molds' },
  { icon: Package, label: 'Products', to: '/products' },
  { icon: Boxes, label: 'Raw Materials', to: '/raw-materials' },
  { icon: BarChart3, label: 'Production Orders', to: '/production-orders' },
  { icon: Warehouse, label: 'Finished Goods', to: '/finished-goods' },
  { icon: UsersRound, label: 'Customers', to: '/customers' },
  { icon: ShoppingCart, label: 'Sales Orders', to: '/sales-orders' },
  { icon: ShieldCheck, label: 'Quality Control', to: '/quality-control' },
  { icon: Activity, label: 'Maintenance', to: '/maintenance' },
  { icon: TrendingUp, label: 'Purchase Orders', to: '/purchase-orders' },
  { icon: BarChart2, label: 'Reports', to: '/reports' },
  { icon: Settings, label: 'Settings', to: '/settings' }
];

const menuTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/users': 'Users Management',
  '/machines': 'Machines Management',
  '/molds': 'Molds Management',
  '/products': 'Products Management',
  '/raw-materials': 'Raw Materials Management',
  '/production-orders': 'Production Orders',
  '/finished-goods': 'Finished Goods Inventory',
  '/customers': 'Customers Management',
  '/sales-orders': 'Sales Orders',
  '/quality-control': 'Quality Control',
  '/maintenance': 'Maintenance Schedule',
  '/purchase-orders': 'Purchase Orders',
  '/reports': 'Reports & Analytics',
  '/settings': 'System Settings',
  // Legacy routes
  '/production': 'Production Orders',
  '/quality': 'Quality Control',
  '/inventory': 'Finished Goods Inventory',
  '/sales': 'Sales Orders'
};

interface DashboardProps {
  handleLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ handleLogout }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // Use theme context from provider
  const { isLightMode, setIsLightMode, currentTheme, setCurrentTheme, currentThemeData } = useTheme();
  const currentTitle = menuTitles[location.pathname] || 'ERP';

  return (
    <div
      className="min-h-screen"
      style={{
        background: currentThemeData.bg,
        color: currentThemeData.text,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? 'w-20' : 'w-52'} fixed top-0 left-0 h-screen z-30 transition-all duration-300 border-r flex flex-col`}
        style={{
          background: currentThemeData.surface,
          borderColor: currentThemeData.border
        }}
      >
        {/* Logo */}
        <div
          className="h-18 flex items-center justify-center cursor-pointer hover:bg-opacity-50 transition-all duration-200"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            borderBottom: `1px solid ${currentThemeData.border}`,
            background: `${currentThemeData.bg}50`
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(45deg, ${currentThemeData.primary}, ${currentThemeData.accent})`
              }}
            >
              <Zap size={20} style={{ color: currentThemeData.bg }} />
            </div>
            {!sidebarCollapsed && (
              <span
                className="text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(45deg, ${currentThemeData.primary}, ${currentThemeData.accent})`
                }}
              >
                FutureTech
              </span>
            )}
          </div>
        </div>
        {/* Item Menu - scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={index}
                  to={item.to}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${isActive ? 'shadow-lg' : ''}`}
                  style={{
                    background: isActive
                      ? `linear-gradient(45deg, ${currentThemeData.primary}20, ${currentThemeData.accent}20)`
                      : 'transparent',
                    borderLeft: isActive ? `3px solid ${currentThemeData.primary}` : 'none'
                  }}
                >
                  <item.icon
                    size={20}
                    style={{ color: isActive ? currentThemeData.primary : currentThemeData.textSecondary }}
                  />
                  {/* Tampilkan label hanya jika sidebar tidak collapsed */}
                  {!sidebarCollapsed ? (
                    <span
                      className="font-medium"
                      style={{ color: isActive ? currentThemeData.primary : currentThemeData.text }}
                    >
                      {item.label}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
        {/* Keluar */}
        <div className="p-4 border-t" style={{ borderColor: currentThemeData.border }}>
          <div
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-opacity-50"
            onClick={handleLogout}
            style={{ color: currentThemeData.textSecondary }}
          >
            <LogOut size={20} />
            {!sidebarCollapsed && <span>Keluar</span>}
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div
        className="flex-1 flex flex-col"
        style={{
          marginLeft: sidebarCollapsed ? 80 : 208, // 80px = w-20, 208px = w-52
          transition: 'margin-left 0.3s'
        }}
      >
        {/* Header */}
        <header
          className="h-18 px-6 flex items-center justify-between border-b sticky top-0 z-10 backdrop-blur-lg"
          style={{
            background: `${currentThemeData.surface}95`,
            borderColor: currentThemeData.border
          }}
        >
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold" style={{ color: currentThemeData.text }}>
              {currentTitle}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Tombol Mode Terang/Gelap */}
            <ThemedButton
              onClick={() => setIsLightMode(!isLightMode)}
              style={{ color: currentThemeData.textSecondary, background: 'none', border: 'none', padding: 8, borderRadius: 8 }}
            >
              {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
            </ThemedButton>
            {/* Tombol Tema */}
            <div className="relative">
              <ThemedButton
                onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                style={{ color: currentThemeData.textSecondary, background: 'none', border: 'none', padding: 8, borderRadius: 8 }}
              >
                <Palette size={20} />
              </ThemedButton>
              {showThemeDropdown && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl border backdrop-blur-lg z-20"
                  style={{
                    background: `${currentThemeData.surface}95`,
                    borderColor: currentThemeData.border
                  }}
                >
                  {Object.entries(themesConfig).map(([key, themeFunc]) => {
                    const theme = themeFunc(isLightMode);
                    return (
                      <ThemedButton
                        key={key}
                        onClick={() => {
                          setCurrentTheme(key);
                          setShowThemeDropdown(false);
                        }}
                        style={{
                          color: key === currentTheme ? theme.primary : currentThemeData.text,
                          backgroundColor: key === currentTheme ? `${theme.primary}20` : 'transparent',
                          width: '100%',
                          textAlign: 'left',
                          padding: 12,
                          borderRadius: 8,
                          marginBottom: 2
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ background: theme.primary, display: 'inline-block', marginRight: 8 }}
                        />
                        {theme.name}
                      </ThemedButton>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Notifikasi */}
            <ThemedButton
              style={{ color: currentThemeData.textSecondary, background: 'none', border: 'none', padding: 8, borderRadius: 8, position: 'relative' }}
            >
              <Bell size={20} />
              <div
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                style={{ background: currentThemeData.accent }}
              />
            </ThemedButton>
            {/* Dropdown Profil */}
            <div className="relative">
              <ThemedButton
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                style={{ color: currentThemeData.text, background: 'none', border: 'none', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: `linear-gradient(45deg, ${currentThemeData.primary}, ${currentThemeData.accent})`,
                    color: isLightMode ? '#ffffff' : currentThemeData.bg
                  }}
                >
                  JD
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">John Doe</div>
                  <div className="text-xs" style={{ color: currentThemeData.textSecondary }}>
                    Admin
                  </div>
                </div>
                <ChevronDown size={16} />
              </ThemedButton>
              {showProfileDropdown && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl border backdrop-blur-lg z-20"
                  style={{
                    background: `${currentThemeData.surface}95`,
                    borderColor: currentThemeData.border
                  }}
                >
                  <div className="p-3 border-b" style={{ borderColor: currentThemeData.border }}>
                    <div className="font-medium" style={{ color: currentThemeData.text }}>John Doe</div>
                    <div className="text-sm" style={{ color: currentThemeData.textSecondary }}>john@example.com</div>
                  </div>
                  <div className="py-2">
                    <ThemedButton className="w-full p-2 text-left hover:bg-opacity-50 transition-all duration-200" style={{ color: currentThemeData.text }}>
                      Profil
                    </ThemedButton>
                    <ThemedButton className="w-full p-2 text-left hover:bg-opacity-50 transition-all duration-200" style={{ color: currentThemeData.text }}>
                      Pengaturan
                    </ThemedButton>
                    <ThemedButton
                      className="w-full p-2 text-left hover:bg-opacity-50 transition-all duration-200"
                      style={{ color: currentThemeData.accent }}
                      onClick={handleLogout}
                    >
                      Keluar
                    </ThemedButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        {/* Konten Utama */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4" style={{ color: currentThemeData.text }}>
              Dashboard Siap Digunakan!
            </h2>
            <p style={{ color: currentThemeData.textSecondary }}>
              Area konten utama dashboard Anda. Silakan tambahkan komponen yang diperlukan.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
