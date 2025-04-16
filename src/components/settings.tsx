import { useState } from 'react'
import { FiUser, FiGlobe, FiShield } from 'react-icons/fi'
import { countries } from '@/utils/countries'

// Tab interfaces
type SettingsTab = 'profile' | 'privacy'

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  
  // Profile state
  const [profileForm, setProfileForm] = useState({
    name: 'User Name',
    email: 'user@example.com',
    username: 'jade_trader',
    bio: 'Passionate collector and trader of rare artifacts.',
    location: 'Hong Kong',
    website: 'https://example.com'
  })
  
  // Privacy state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    activityVisibility: 'followers',
    allowMessages: 'authenticated',
    showLocation: true
  })
  
  // Account deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    })
  }

  const handlePrivacyChange = (setting: keyof typeof privacySettings) => {
    if (typeof privacySettings[setting] === 'boolean') {
      setPrivacySettings({
        ...privacySettings,
        [setting]: !privacySettings[setting]
      })
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-32 h-32 rounded-full bg-foreground/10 flex items-center justify-center text-4xl">
                {profileForm.name.charAt(0)}
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Profile Picture</h3>
                <p className="text-foreground/70 mb-4">
                  Upload a photo to personalize your account
                </p>
                
                <div className="flex gap-3">
                  <button className="button-primary py-1 px-4">Upload</button>
                  <button className="button py-1 px-4">Remove</button>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border-2 border-foreground/10 rounded-md text-black"
                  />
                </div>
                
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={profileForm.username}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border-2 border-foreground/10 rounded-md text-black"
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={profileForm.location}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border-2 border-foreground/10 rounded-md text-black"
                  />
                </div>
                
                <div>
                  <label htmlFor="website" className="block text-sm font-medium mb-1">Website</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={profileForm.website}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border-2 border-foreground/10 rounded-md text-black"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                    rows={4}
                    className="w-full px-3 py-2 border-2 border-foreground/10 rounded-md text-black"
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button className="button-primary px-4 py-2">Save Changes</button>
              </div>
            </div>
          </div>
        )
        
      case 'privacy':
        return (
          <div className="space-y-6">
            <button className="button mb-2 w-full justify-start text-left">View Privacy Policy</button>
            <button className="button mb-2 w-full justify-start text-left">Manage Cookies</button>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="button text-red-500 w-full justify-start text-left"
            >
              Delete Account
            </button>
          </div>
        )
    }
  }

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-3xl font-bold mb-6">Settings</h2>
      
      {/* Tabs Navigation - removed the notifications tab */}
      <div className="flex border-b-2 border-foreground/10 mb-6 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1 px-4 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'profile' ? 'border-foreground text-foreground' : 'border-transparent text-foreground/50 hover:text-foreground/80'
          }`}
        >
          <FiUser className="w-4 h-4" />
          <span>Profile</span>
        </button>
        
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-1 px-4 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'privacy' ? 'border-foreground text-foreground' : 'border-transparent text-foreground/50 hover:text-foreground/80'
          }`}
        >
          <FiShield className="w-4 h-4" />
          <span>Privacy</span>
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="bg-background rounded-lg flex-1 overflow-y-auto">
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full p-6 border-2 border-foreground/10">
            <h3 className="text-xl font-bold text-red-500 mb-2">Delete Account</h3>
            <p className="text-foreground/70 mb-4">
              This action cannot be undone. All of your data, including profile information, listings, and messages will be permanently deleted.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                To confirm, type <span className="font-bold">{profileForm.username}</span> below:
              </label>
              <input 
                type="text" 
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full px-3 py-2 border-2 border-foreground/10 rounded-md text-black"
                placeholder={`Type ${profileForm.username} to confirm`}
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <button 
                className="button px-4 py-2"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmation('')
                }}
              >
                Cancel
              </button>
              <button 
                className="button bg-red-500 text-white px-4 py-2 disabled:opacity-50"
                disabled={deleteConfirmation !== profileForm.username}
                onClick={() => {
                  // Here you would call your API to delete the account
                  alert('Account deletion initiated. In a real app, this would delete your account.')
                  setShowDeleteModal(false)
                  setDeleteConfirmation('')
                }}
              >
                Permanently Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}