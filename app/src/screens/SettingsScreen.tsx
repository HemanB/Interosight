import React, { useState } from 'react';
import { User, Shield, Download, Trash2, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SettingsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'data'>('profile');
  const { userProfile } = useAuth();

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account and preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'profile', name: 'Profile', icon: User },
              { id: 'privacy', name: 'Privacy', icon: Shield },
              { id: 'data', name: 'Data', icon: Download },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 inline mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'profile' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Your display name"
                  defaultValue={userProfile?.displayName || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="your.email@example.com"
                  defaultValue={userProfile?.email || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age (Optional)
                </label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Your age"
                  min="13"
                  max="120"
                  defaultValue={userProfile?.age || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender Identity (Optional)
                </label>
                <select className="input-field" defaultValue={userProfile?.gender || ''}>
                  <option value="">Prefer not to say</option>
                  <option value="woman">Woman</option>
                  <option value="man">Man</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="gender-fluid">Gender fluid</option>
                  <option value="agender">Agender</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button className="btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div className="card border-orange-200 bg-orange-50">
              <div className="flex items-center mb-3">
                <AlertTriangle className="w-6 h-6 text-orange-600 mr-2" />
                <h3 className="text-lg font-semibold text-orange-900">Beta Privacy Notice</h3>
              </div>
              <div className="space-y-3 text-sm text-orange-800">
                <p>
                  <strong>Important:</strong> This is a beta application with limited privacy protections. 
                  While we implement standard security measures, we cannot guarantee complete data privacy or protection.
                </p>
                <p>
                  <strong>Recommendation:</strong> Please keep identifiable information to a minimum when using this beta version. 
                  Consider using a pseudonym and avoid sharing highly sensitive personal details.
                </p>
                <p>
                  <strong>Data Handling:</strong> Your data is stored securely, but as this is a beta application, 
                  we cannot provide the same level of privacy guarantees as a production system.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Data Management</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Export Data</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Download your data in different formats for backup or sharing with healthcare providers.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button className="btn-secondary flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      Download JSON
                    </button>
                    <button className="btn-secondary flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Export as PDF
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Data Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-primary-600">3</p>
                      <p className="text-sm text-gray-600">Journal Entries</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">3</p>
                      <p className="text-sm text-gray-600">Meal Logs</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">2</p>
                      <p className="text-sm text-gray-600">Behavior Logs</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">240</p>
                      <p className="text-sm text-gray-600">Total Words</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-red-200 bg-red-50">
              <div className="flex items-center mb-3">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
                <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
              </div>
              <div>
                <h3 className="font-medium text-red-900 mb-2">Delete Account</h3>
                <p className="text-sm text-red-700 mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button className="btn-secondary text-red-600 border-red-300 hover:bg-red-100 flex items-center">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsScreen; 