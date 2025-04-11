import { useState } from 'react'
import { FiUser, FiLock, FiCreditCard, FiEye, FiEyeOff, FiGlobe, FiShield } from 'react-icons/fi'
import { countries } from '@/utils/countries'

// Tab interfaces - removed 'notifications'
type SettingsTab = 'profile' | 'security' | 'payment' | 'privacy'

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
  
  // Security state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'Credit Card', last4: '4242', expiry: '04/24', default: true },
    { id: 2, type: 'PayPal', email: 'user@example.com', default: false }
  ])
  
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

  const setDefaultPaymentMethod = (id: number) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      default: method.id === id
    })))
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
                  <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-foreground/10 rounded-md text-black"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-foreground/10 rounded-md text-black"
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
                    className="w-full px-3 py-2 border border-foreground/10 rounded-md text-black"
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
                    className="w-full px-3 py-2 border border-foreground/10 rounded-md text-black"
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
                    className="w-full px-3 py-2 border border-foreground/10 rounded-md text-black"
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
                    className="w-full px-3 py-2 border border-foreground/10 rounded-md text-black"
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button className="button-primary px-4 py-2">Save Changes</button>
              </div>
            </div>
          </div>
        )
        
      case 'security':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Change Password</h3>
              
              <div className="space-y-4 max-w-lg">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currentPassword"
                      className="w-full px-3 py-2 border border-foreground/10 rounded-md pr-10 text-black"
                    />
                    <button 
                      type="button" 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      className="w-full px-3 py-2 border border-foreground/10 rounded-md pr-10 text-black"
                    />
                    <button 
                      type="button" 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      className="w-full px-3 py-2 border border-foreground/10 rounded-md pr-10 text-black"
                    />
                    <button 
                      type="button" 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                
                <div className="pt-2">
                  <button className="button-primary px-4 py-2">Update Password</button>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Login Sessions</h3>
              
              <div className="bg-background-light border border-foreground/10 rounded-lg">
                <div className="p-4 border-b border-foreground/10">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-foreground/70">Mac OS • Chrome • Hong Kong</p>
                    </div>
                    <span className="text-green-500 text-sm">Active Now</span>
                  </div>
                </div>
                
                <div className="p-4 border-b border-foreground/10">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">iOS Device</p>
                      <p className="text-sm text-foreground/70">iOS • Safari • Hong Kong</p>
                    </div>
                    <span className="text-foreground/70 text-sm">2 days ago</span>
                  </div>
                </div>
                
                <div className="p-4">
                  <button className="button-primary text-sm">Sign out all other sessions</button>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Account Actions</h3>
              
              <div className="flex items-center justify-between p-4 bg-background-light border border-foreground/10 rounded-lg">
                <div>
                  <p className="font-medium">Delete your account</p>
                  <p className="text-sm text-foreground/70">
                    Permanently remove your account and all associated data from The Jade Trail.
                  </p>
                </div>
                
                <button 
                  className="button text-red-500 px-4 py-2"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )
        
      case 'payment':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold mb-4">Payment Methods</h3>
            
            <div className="bg-background-light border border-foreground/10 rounded-lg divide-y divide-foreground/10">
              {paymentMethods.map(method => (
                <div key={method.id} className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    {method.type === 'Credit Card' ? (
                      <div className="w-10 h-10 bg-foreground/10 rounded flex items-center justify-center mr-4">
                        <FiCreditCard size={20} />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-foreground/10 rounded flex items-center justify-center mr-4">
                        <FiGlobe size={20} />
                      </div>
                    )}
                    
                    <div>
                      <p className="font-medium">{method.type}</p>
                      {method.type === 'Credit Card' ? (
                        <p className="text-sm text-foreground/70">•••• {method.last4} | Expires {method.expiry}</p>
                      ) : (
                        <p className="text-sm text-foreground/70">{method.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {method.default ? (
                      <span className="text-sm text-green-500">Default</span>
                    ) : (
                      <button 
                        onClick={() => setDefaultPaymentMethod(method.id)} 
                        className="text-sm text-blue-500 hover:underline"
                      >
                        Set as default
                      </button>
                    )}
                    <button className="button py-1 px-3 h-auto text-sm">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="button-primary px-4 py-2">Add Payment Method</button>
            
            <h3 className="text-xl font-bold mt-8 mb-4">Billing Address</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="addressName" className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  id="addressName"
                  className="w-full px-3 py-2 border border-foreground/10 rounded-md text-black"
                  defaultValue={profileForm.name}
                />
              </div>
              
              <div>
                <label htmlFor="addressLine1" className="block text-sm font-medium mb-1">Address Line 1</label>
                <input
                  type="text"
                  id="addressLine1"
                  className="w-full px-3 py-2 border border-foreground/10 rounded-md text-black"
                />
              </div>
              
              <div>
                <label htmlFor="addressLine2" className="block text-sm font-medium mb-1">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  id="addressLine2"
                  className="w-full px-3 py-2 border border-foreground/10 rounded-md text-black"
                />
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  id="city"
                  className="w-full px-3 py-2 border border-foreground/10 rounded-md text-black"
                />
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium mb-1">State/Province</label>
                <input
                  type="text"
                  id="state"
                  className="w-full px-3 py-2 border border-foreground/10 rounded-md text-black"
                />
              </div>
              
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium mb-1">ZIP/Postal Code</label>
                <input
                  type="text"
                  id="zipCode"
                  className="w-full px-3 py-2 border border-foreground/10 rounded-md text-black"
                />
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium mb-1">Country</label>
                <select
                  id="country"
                  className="w-full px-3 py-2 border border-foreground/10 rounded-md text-black"
                  defaultValue="HK"
                >
                  {countries.filter(country => country.id !== 'all').map(country => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button className="button-primary px-4 py-2">Save Address</button>
            </div>
          </div>
        )
        
      case 'privacy':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold mb-4">Privacy Settings</h3>
            
            <div className="space-y-6">
              <div className="bg-background-light p-4 border border-foreground/10 rounded-lg">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Profile Visibility</label>
                  <select
                    className="w-full px-3 py-2 border border-foreground/10 rounded-md text-black"
                    value={privacySettings.profileVisibility}
                    onChange={(e) => setPrivacySettings({...privacySettings, profileVisibility: e.target.value})}
                  >
                    <option value="public">Public - Anyone can view your profile</option>
                    <option value="followers">Followers Only - Only people who follow you can view</option>
                    <option value="private">Private - Only you can view your profile</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Activity Visibility</label>
                  <select
                    className="w-full px-3 py-2 border border-foreground/10 rounded-md text-black"
                    value={privacySettings.activityVisibility}
                    onChange={(e) => setPrivacySettings({...privacySettings, activityVisibility: e.target.value})}
                  >
                    <option value="public">Public - Anyone can see your activity</option>
                    <option value="followers">Followers Only - Only people who follow you can see</option>
                    <option value="private">Private - Only you can see your activity</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Who Can Message You</label>
                  <select
                    className="w-full px-3 py-2 border border-foreground/10 rounded-md text-black"
                    value={privacySettings.allowMessages}
                    onChange={(e) => setPrivacySettings({...privacySettings, allowMessages: e.target.value})}
                  >
                    <option value="authenticated">Authenticated Users - Any registered user</option>
                    <option value="followers">Followers Only - Only people who follow you</option>
                    <option value="nobody">Nobody - Turn off messages</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Show Location</p>
                    <p className="text-sm text-foreground/70">Display your location on your profile</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      id="showLocation" 
                      checked={privacySettings.showLocation}
                      onChange={() => handlePrivacyChange('showLocation')}
                      className="sr-only"
                    />
                    <label 
                      htmlFor="showLocation"
                      className={`block overflow-hidden h-6 rounded-full bg-foreground/10 cursor-pointer ${privacySettings.showLocation ? 'bg-green-500' : ''}`}
                    >
                      <span 
                        className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${privacySettings.showLocation ? 'translate-x-4' : 'translate-x-0'}`}
                      ></span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="bg-background-light p-4 border border-foreground/10 rounded-lg">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <FiShield />
                  <span>Security Preferences</span>
                </h4>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Login Notifications</p>
                    <p className="text-sm text-foreground/70">Get notified when someone logs into your account</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      id="loginNotifications" 
                      className="sr-only"
                    />
                    <label 
                      htmlFor="loginNotifications"
                      className="block overflow-hidden h-6 rounded-full bg-foreground/10 cursor-pointer"
                    >
                      <span 
                        className="block h-6 w-6 rounded-full bg-white shadow transform transition-transform translate-x-0"
                      ></span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="bg-background-light p-4 border border-foreground/10 rounded-lg">
                <h4 className="font-bold mb-4">Data & Privacy</h4>
                
                <button className="button mb-2 w-full justify-start text-left">Export Your Data</button>
                <button className="button mb-2 w-full justify-start text-left">View Privacy Policy</button>
                <button className="button mb-2 w-full justify-start text-left">Manage Cookies</button>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="button text-red-500 w-full justify-start text-left"
                >
                  Delete Account
                </button>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button className="button-primary px-4 py-2">Save Privacy Settings</button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="h-full">
      <h2 className="text-3xl font-bold mb-6">Settings</h2>
      
      {/* Tabs Navigation - removed the notifications tab */}
      <div className="flex border-b border-foreground/10 mb-6 overflow-x-auto hide-scrollbar">
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
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-1 px-4 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'security' ? 'border-foreground text-foreground' : 'border-transparent text-foreground/50 hover:text-foreground/80'
          }`}
        >
          <FiLock className="w-4 h-4" />
          <span>Security</span>
        </button>
        
        <button
          onClick={() => setActiveTab('payment')}
          className={`flex items-center gap-1 px-4 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'payment' ? 'border-foreground text-foreground' : 'border-transparent text-foreground/50 hover:text-foreground/80'
          }`}
        >
          <FiCreditCard className="w-4 h-4" />
          <span>Payment</span>
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
      <div className="bg-background rounded-lg">
        {renderTabContent()}
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
                className="w-full px-3 py-2 border border-foreground/10 rounded-md text-black"
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