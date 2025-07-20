
import React from 'react';
import { Moon, Sun, Palette, Zap, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  currentThemeData: any;
  setIsLightMode: (value: boolean) => void;
  isLightMode: boolean;
  themes: any;
  setCurrentTheme: (theme: string) => void;
  showThemeDropdown: boolean;
  setShowThemeDropdown: (value: boolean) => void;
  loginData: { email: string; password: string };
  setLoginData: (data: { email: string; password: string }) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  setIsLoggedIn: (value: boolean) => void;
  currentTheme: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ 
  currentThemeData, 
  setIsLightMode, 
  isLightMode, 
  themes, 
  setCurrentTheme, 
  showThemeDropdown, 
  setShowThemeDropdown, 
  loginData, 
  setLoginData, 
  showPassword, 
  setShowPassword, 
  setIsLoggedIn,
  currentTheme
}) => { 
  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${currentThemeData.bg}, ${currentThemeData.secondary})`,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Latar Belakang Animasi */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 300 + 50}px`,
              height: `${Math.random() * 300 + 50}px`,
              background: `radial-gradient(circle, ${currentThemeData.primary}20 0%, transparent 70%)`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>

      {/* Pemilih Tema & Mode Terang */}
      <div className="absolute top-6 right-6 z-20 flex gap-3">
        {/* Tombol Mode Terang/Gelap */}
        <button
          onClick={() => setIsLightMode(!isLightMode)}
          className="p-3 rounded-full backdrop-blur-lg border transition-all duration-300 hover:scale-110"
          style={{
            background: `${currentThemeData.surface}80`,
            borderColor: currentThemeData.border,
            color: currentThemeData.text
          }}
        >
          {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Pemilih Tema */}
        <div className="relative">
          <button
            onClick={() => setShowThemeDropdown(!showThemeDropdown)}
            className="p-3 rounded-full backdrop-blur-lg border transition-all duration-300 hover:scale-110"
            style={{
              background: `${currentThemeData.surface}80`,
              borderColor: currentThemeData.border,
              color: currentThemeData.text
            }}
          >
            <Palette size={20} />
          </button>
          
          {showThemeDropdown && (
            <div 
              className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl border backdrop-blur-lg z-30"
              style={{
                background: `${currentThemeData.surface}95`,
                borderColor: currentThemeData.border
              }}
            >
              {Object.entries(themes).map(([key, themeFunc]: [string, any]) => {
                const theme = themeFunc(isLightMode);
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setCurrentTheme(key);
                      setShowThemeDropdown(false);
                    }}
                    className="w-full p-3 text-left hover:bg-opacity-50 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl flex items-center gap-3"
                    style={{
                      color: key === currentTheme ? theme.primary : currentThemeData.text,
                      backgroundColor: key === currentTheme ? `${theme.primary}20` : 'transparent'
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ background: theme.primary }}
                    />
                    {theme.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Formulir Login */}
      <div 
        className="relative z-10 w-full max-w-md p-8 rounded-2xl backdrop-blur-xl border shadow-2xl"
        style={{
          background: `${currentThemeData.surface}90`,
          borderColor: currentThemeData.border
        }}
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(45deg, ${currentThemeData.primary}, ${currentThemeData.accent})`
              }}
            >
              <Zap size={32} style={{ color: currentThemeData.bg }} />
            </div>
          </div>
          <h1 
            className="text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(45deg, ${currentThemeData.primary}, ${currentThemeData.accent})`
            }}
          >
            FutureTech
          </h1>
          <p style={{ color: currentThemeData.textSecondary }}>
            Selamat datang di masa depan dashboard
          </p>
        </div>

        <div>
          <div className="mb-6">
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: currentThemeData.textSecondary }}
            >
              Email
            </label>
            <input
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              className="w-full p-4 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
              style={{
                background: currentThemeData.bg,
                borderColor: currentThemeData.border,
                color: currentThemeData.text
              }}
              placeholder="Masukkan email Anda"
            />
          </div>

          <div className="mb-6">
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: currentThemeData.textSecondary }}
            >
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full p-4 pr-12 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
                style={{
                  background: currentThemeData.bg,
                  borderColor: currentThemeData.border,
                  color: currentThemeData.text
                }}
                placeholder="Masukkan kata sandi Anda"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-opacity-10 hover:bg-white rounded transition-all duration-200"
                style={{ color: currentThemeData.textSecondary }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsLoggedIn(true)}
            className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{
              background: `linear-gradient(45deg, ${currentThemeData.primary}, ${currentThemeData.accent})`
            }}
          >
            Masuk ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
