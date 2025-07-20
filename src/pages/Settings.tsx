import React, { useState } from 'react';
import { useTheme } from '../components/ui/GlobalUI';
import { ThemeSelector } from '../components/common/ThemeSelector';
import ThemedButton from '../components/ui/ThemedButton';
import ThemedInput from '../components/ui/ThemedInput';

interface SystemConfig {
  company_name: string;
  default_currency: string;
  working_hours_per_day: number;
  quality_alert_threshold: number;
  low_stock_alert_threshold: number;
  oee_target: number;
  maintenance_lead_time_days: number;
}

interface NotificationSetting {
  type: string;
  label: string;
  description: string;
  enabled: boolean;
  email: boolean;
  sms: boolean;
  inApp: boolean;
}

export default function Settings() {
  const { currentThemeData } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    company_name: 'PT. Plastik Injection Indonesia',
    default_currency: 'IDR',
    working_hours_per_day: 8,
    quality_alert_threshold: 5,
    low_stock_alert_threshold: 20,
    oee_target: 85,
    maintenance_lead_time_days: 7
  });

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      type: 'machine_breakdown',
      label: 'Machine Breakdown',
      description: 'Alert when machines break down or go offline',
      enabled: true,
      email: true,
      sms: true,
      inApp: true
    },
    {
      type: 'quality_alert',
      label: 'Quality Issues',
      description: 'Alert when quality metrics fall below threshold',
      enabled: true,
      email: true,
      sms: false,
      inApp: true
    },
    {
      type: 'stock_low',
      label: 'Low Stock',
      description: 'Alert when inventory levels are low',
      enabled: true,
      email: true,
      sms: false,
      inApp: true
    },
    {
      type: 'maintenance_due',
      label: 'Maintenance Due',
      description: 'Alert when maintenance is due or overdue',
      enabled: true,
      email: true,
      sms: false,
      inApp: true
    },
    {
      type: 'production_target',
      label: 'Production Targets',
      description: 'Alert when production targets are not met',
      enabled: false,
      email: false,
      sms: false,
      inApp: true
    }
  ]);

  const tabs = [
    { id: 'general', name: 'General Settings', icon: '⚙️' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'appearance', name: 'Appearance', icon: '🎨' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'backup', name: 'Backup & Export', icon: '💾' }
  ];

  const handleSaveConfig = () => {
    // In a real application, this would save to the database
    alert('System configuration saved successfully!');
  };

  const handleNotificationChange = (index: number, field: keyof NotificationSetting, value: boolean) => {
    const updated = [...notifications];
    updated[index] = { ...updated[index], [field]: value };
    setNotifications(updated);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: currentThemeData.text }}>
          Company Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ThemedInput
            placeholder="Company Name"
            value={systemConfig.company_name}
            onChange={e => setSystemConfig(prev => ({ ...prev, company_name: e.target.value }))}
          />
          <select
            className="border p-3 rounded-lg"
            value={systemConfig.default_currency}
            onChange={e => setSystemConfig(prev => ({ ...prev, default_currency: e.target.value }))}
            style={{
              backgroundColor: currentThemeData.surface,
              borderColor: currentThemeData.border,
              color: currentThemeData.text
            }}
          >
            <option value="IDR">Indonesian Rupiah (IDR)</option>
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="SGD">Singapore Dollar (SGD)</option>
          </select>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: currentThemeData.text }}>
          Production Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: currentThemeData.textSecondary }}>
              Working Hours per Day
            </label>
            <ThemedInput
              type="number"
              value={systemConfig.working_hours_per_day}
              onChange={e => setSystemConfig(prev => ({ ...prev, working_hours_per_day: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: currentThemeData.textSecondary }}>
              OEE Target (%)
            </label>
            <ThemedInput
              type="number"
              value={systemConfig.oee_target}
              onChange={e => setSystemConfig(prev => ({ ...prev, oee_target: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: currentThemeData.textSecondary }}>
              Quality Alert Threshold (%)
            </label>
            <ThemedInput
              type="number"
              value={systemConfig.quality_alert_threshold}
              onChange={e => setSystemConfig(prev => ({ ...prev, quality_alert_threshold: Number(e.target.value) }))}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: currentThemeData.text }}>
          Inventory Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: currentThemeData.textSecondary }}>
              Low Stock Alert Threshold (%)
            </label>
            <ThemedInput
              type="number"
              value={systemConfig.low_stock_alert_threshold}
              onChange={e => setSystemConfig(prev => ({ ...prev, low_stock_alert_threshold: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: currentThemeData.textSecondary }}>
              Maintenance Lead Time (days)
            </label>
            <ThemedInput
              type="number"
              value={systemConfig.maintenance_lead_time_days}
              onChange={e => setSystemConfig(prev => ({ ...prev, maintenance_lead_time_days: Number(e.target.value) }))}
            />
          </div>
        </div>
      </div>

      <ThemedButton onClick={handleSaveConfig}>
        Save Configuration
      </ThemedButton>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4" style={{ color: currentThemeData.text }}>
        Notification Preferences
      </h3>
      
      <div className="space-y-4">
        {notifications.map((notification, index) => (
          <div
            key={notification.type}
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: currentThemeData.surface,
              borderColor: currentThemeData.border
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium" style={{ color: currentThemeData.text }}>
                  {notification.label}
                </h4>
                <p className="text-sm" style={{ color: currentThemeData.textSecondary }}>
                  {notification.description}
                </p>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notification.enabled}
                  onChange={e => handleNotificationChange(index, 'enabled', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Enabled</span>
              </label>
            </div>
            
            {notification.enabled && (
              <div className="flex gap-4 text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notification.email}
                    onChange={e => handleNotificationChange(index, 'email', e.target.checked)}
                    className="mr-2"
                  />
                  Email
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notification.sms}
                    onChange={e => handleNotificationChange(index, 'sms', e.target.checked)}
                    className="mr-2"
                  />
                  SMS
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notification.inApp}
                    onChange={e => handleNotificationChange(index, 'inApp', e.target.checked)}
                    className="mr-2"
                  />
                  In-App
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <ThemedButton onClick={() => alert('Notification settings saved!')}>
        Save Notification Settings
      </ThemedButton>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4" style={{ color: currentThemeData.text }}>
        Theme & Appearance
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: currentThemeData.textSecondary }}>
            Color Theme
          </label>
          <ThemeSelector 
            showDropdown={showThemeDropdown}
            setShowDropdown={setShowThemeDropdown}
          />
        </div>
        
        <div className="p-4 rounded-lg border" style={{ backgroundColor: currentThemeData.surface, borderColor: currentThemeData.border }}>
          <h4 className="font-medium mb-2" style={{ color: currentThemeData.text }}>Theme Preview</h4>
          <div className="flex gap-2 mb-2">
            <div className="w-8 h-8 rounded" style={{ backgroundColor: currentThemeData.primary }}></div>
            <div className="w-8 h-8 rounded" style={{ backgroundColor: currentThemeData.secondary }}></div>
            <div className="w-8 h-8 rounded" style={{ backgroundColor: currentThemeData.accent }}></div>
          </div>
          <p className="text-sm" style={{ color: currentThemeData.textSecondary }}>
            Current theme colors and styling
          </p>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4" style={{ color: currentThemeData.text }}>
        Security Settings
      </h3>
      
      <div className="space-y-4">
        <div className="p-4 rounded-lg border" style={{ backgroundColor: currentThemeData.surface, borderColor: currentThemeData.border }}>
          <h4 className="font-medium mb-2" style={{ color: currentThemeData.text }}>Password Policy</h4>
          <div className="space-y-2 text-sm" style={{ color: currentThemeData.textSecondary }}>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Minimum 8 characters</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Require uppercase and lowercase letters</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Require numbers and special characters</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border" style={{ backgroundColor: currentThemeData.surface, borderColor: currentThemeData.border }}>
          <h4 className="font-medium mb-2" style={{ color: currentThemeData.text }}>Session Management</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: currentThemeData.textSecondary }}>Session Timeout</span>
              <span className="text-sm font-medium" style={{ color: currentThemeData.text }}>30 minutes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: currentThemeData.textSecondary }}>Auto Logout</span>
              <span className="text-sm font-medium" style={{ color: currentThemeData.text }}>Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4" style={{ color: currentThemeData.text }}>
        Backup & Data Export
      </h3>
      
      <div className="space-y-4">
        <div className="p-4 rounded-lg border" style={{ backgroundColor: currentThemeData.surface, borderColor: currentThemeData.border }}>
          <h4 className="font-medium mb-2" style={{ color: currentThemeData.text }}>Automatic Backup</h4>
          <p className="text-sm mb-3" style={{ color: currentThemeData.textSecondary }}>
            Automatic daily backup of all system data
          </p>
          <div className="flex gap-2">
            <ThemedButton variant="primary">Configure Backup</ThemedButton>
            <ThemedButton variant="outline">View Backup History</ThemedButton>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border" style={{ backgroundColor: currentThemeData.surface, borderColor: currentThemeData.border }}>
          <h4 className="font-medium mb-2" style={{ color: currentThemeData.text }}>Data Export</h4>
          <p className="text-sm mb-3" style={{ color: currentThemeData.textSecondary }}>
            Export system data for analysis or migration
          </p>
          <div className="flex gap-2">
            <ThemedButton variant="primary">Export All Data</ThemedButton>
            <ThemedButton variant="outline">Export Selected Tables</ThemedButton>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'notifications': return renderNotificationSettings();
      case 'appearance': return renderAppearanceSettings();
      case 'security': return renderSecuritySettings();
      case 'backup': return renderBackupSettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="p-6">
      {/* <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: currentThemeData.text }}>
          System Settings
        </h1>
        <p className="text-gray-600">Configure system preferences and settings</p>
      </div> */}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'hover:bg-opacity-50'
                }`}
                style={{
                  backgroundColor: activeTab === tab.id ? currentThemeData.primary : 'transparent',
                  color: activeTab === tab.id ? 'white' : currentThemeData.text
                }}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: currentThemeData.surface,
              borderColor: currentThemeData.border
            }}
          >
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}