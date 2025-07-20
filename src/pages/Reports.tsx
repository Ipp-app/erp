import React, { useState } from 'react';
import { useTheme } from '../components/ui/GlobalUI';
import ThemedButton from '../components/ui/ThemedButton';
import ThemedInput from '../components/ui/ThemedInput';

interface ReportCard {
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
}

const reportCategories = [
  { id: 'production', name: 'Production Reports', color: 'bg-blue-100 text-blue-800' },
  { id: 'quality', name: 'Quality Reports', color: 'bg-green-100 text-green-800' },
  { id: 'inventory', name: 'Inventory Reports', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'financial', name: 'Financial Reports', color: 'bg-purple-100 text-purple-800' },
  { id: 'maintenance', name: 'Maintenance Reports', color: 'bg-red-100 text-red-800' },
  { id: 'sales', name: 'Sales Reports', color: 'bg-indigo-100 text-indigo-800' }
];

const availableReports: ReportCard[] = [
  {
    title: 'Daily Production Summary',
    description: 'Daily production output, efficiency, and downtime summary',
    category: 'production',
    icon: '📊',
    color: 'border-blue-200'
  },
  {
    title: 'Machine Utilization Report',
    description: 'Machine usage, availability, and performance metrics',
    category: 'production',
    icon: '⚙️',
    color: 'border-blue-200'
  },
  {
    title: 'OEE Analysis',
    description: 'Overall Equipment Effectiveness analysis by machine and period',
    category: 'production',
    icon: '📈',
    color: 'border-blue-200'
  },
  {
    title: 'Quality Control Dashboard',
    description: 'Quality metrics, defect rates, and inspection results',
    category: 'quality',
    icon: '🔍',
    color: 'border-green-200'
  },
  {
    title: 'Customer Complaints Report',
    description: 'Customer complaint tracking and resolution status',
    category: 'quality',
    icon: '📋',
    color: 'border-green-200'
  },
  {
    title: 'Inventory Status Report',
    description: 'Current stock levels, reorder points, and inventory valuation',
    category: 'inventory',
    icon: '📦',
    color: 'border-yellow-200'
  },
  {
    title: 'Material Consumption Report',
    description: 'Raw material usage, waste analysis, and cost tracking',
    category: 'inventory',
    icon: '📊',
    color: 'border-yellow-200'
  },
  {
    title: 'Production Cost Analysis',
    description: 'Cost breakdown by product, machine, and time period',
    category: 'financial',
    icon: '💰',
    color: 'border-purple-200'
  },
  {
    title: 'Sales Performance Report',
    description: 'Sales orders, delivery performance, and customer analysis',
    category: 'sales',
    icon: '📈',
    color: 'border-indigo-200'
  },
  {
    title: 'Maintenance Schedule Report',
    description: 'Planned and completed maintenance activities',
    category: 'maintenance',
    icon: '🔧',
    color: 'border-red-200'
  }
];

export default function Reports() {
  const { currentThemeData } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const filteredReports = selectedCategory === 'all' 
    ? availableReports 
    : availableReports.filter(report => report.category === selectedCategory);

  const handleGenerateReport = (reportTitle: string) => {
    // In a real application, this would generate and download the report
    alert(`Generating ${reportTitle}...\nDate Range: ${dateRange.startDate || 'All'} to ${dateRange.endDate || 'All'}`);
  };

  return (
    <div className="p-6">
      {/* <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: currentThemeData.text }}>
          Reports & Analytics
        </h1>
        <p className="text-gray-600">Generate comprehensive reports for business insights</p>
      </div> */}

      {/* Date Range Filter */}
      <div 
        className="mb-6 p-4 rounded-lg border"
        style={{ 
          backgroundColor: currentThemeData.surface,
          borderColor: currentThemeData.border 
        }}
      >
        <h3 className="text-lg font-semibold mb-3" style={{ color: currentThemeData.text }}>
          Report Parameters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ThemedInput
            type="date"
            placeholder="Start Date"
            value={dateRange.startDate}
            onChange={e => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
          />
          <ThemedInput
            type="date"
            placeholder="End Date"
            value={dateRange.endDate}
            onChange={e => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
          />
          <ThemedButton
            onClick={() => setDateRange({ startDate: '', endDate: '' })}
            variant="outline"
          >
            Clear Dates
          </ThemedButton>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all' 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Reports
          </button>
          {reportCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id 
                  ? category.color 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report, index) => (
          <div
            key={index}
            className={`p-6 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${report.color}`}
            style={{ backgroundColor: currentThemeData.surface }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{report.icon}</div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                reportCategories.find(cat => cat.id === report.category)?.color || 'bg-gray-100 text-gray-800'
              }`}>
                {reportCategories.find(cat => cat.id === report.category)?.name || report.category}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold mb-2" style={{ color: currentThemeData.text }}>
              {report.title}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              {report.description}
            </p>
            
            <div className="flex gap-2">
              <ThemedButton
                onClick={() => handleGenerateReport(report.title)}
                className="flex-1"
                variant="primary"
              >
                Generate
              </ThemedButton>
              <ThemedButton
                onClick={() => alert(`Scheduling ${report.title}...`)}
                variant="outline"
              >
                Schedule
              </ThemedButton>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: currentThemeData.text }}>
            No Reports Found
          </h3>
          <p className="text-gray-600">
            No reports available for the selected category.
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          className="p-4 rounded-lg text-center"
          style={{ backgroundColor: currentThemeData.surface, border: `1px solid ${currentThemeData.border}` }}
        >
          <div className="text-2xl font-bold" style={{ color: currentThemeData.primary }}>
            {availableReports.length}
          </div>
          <div className="text-sm text-gray-600">Available Reports</div>
        </div>
        <div 
          className="p-4 rounded-lg text-center"
          style={{ backgroundColor: currentThemeData.surface, border: `1px solid ${currentThemeData.border}` }}
        >
          <div className="text-2xl font-bold" style={{ color: currentThemeData.primary }}>
            {reportCategories.length}
          </div>
          <div className="text-sm text-gray-600">Report Categories</div>
        </div>
        <div 
          className="p-4 rounded-lg text-center"
          style={{ backgroundColor: currentThemeData.surface, border: `1px solid ${currentThemeData.border}` }}
        >
          <div className="text-2xl font-bold" style={{ color: currentThemeData.primary }}>
            24/7
          </div>
          <div className="text-sm text-gray-600">Report Generation</div>
        </div>
        <div 
          className="p-4 rounded-lg text-center"
          style={{ backgroundColor: currentThemeData.surface, border: `1px solid ${currentThemeData.border}` }}
        >
          <div className="text-2xl font-bold" style={{ color: currentThemeData.primary }}>
            Real-time
          </div>
          <div className="text-sm text-gray-600">Data Updates</div>
        </div>
      </div>
    </div>
  );
}