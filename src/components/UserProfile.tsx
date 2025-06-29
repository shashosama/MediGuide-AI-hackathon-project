import React, { useState, useEffect } from 'react';
import { authManager } from '@/utils/authManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Plus, X, Save, BarChart3, Edit, UserPlus, LogIn } from 'lucide-react';

interface UserProfileProps {
  onProfileUpdate?: (profile: any) => void;
  onNavigateToLogin?: () => void;
  onNavigateToRegister?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  onProfileUpdate,
  onNavigateToLogin,
  onNavigateToRegister
}) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: '',
    allergies: [] as string[],
    medications: [] as string[],
    chronicConditions: [] as string[],
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      if (authManager.isLoggedIn()) {
        const user = await authManager.getCurrentUserWithProfile();
        setCurrentUser(user);
        
        if (user?.profile) {
          setFormData({
            name: user.profile.name || '',
            dateOfBirth: user.profile.date_of_birth || '',
            gender: user.profile.gender || '',
            allergies: user.profile.allergies || [],
            medications: user.profile.medications || [],
            chronicConditions: user.profile.chronic_conditions || [],
            emergencyContact: user.profile.emergency_contact || {
              name: '',
              phone: '',
              relationship: ''
            }
          });
        }
      }
    };
    
    loadUser();
  }, []);

  const calculateAge = (dateOfBirth: string): number | undefined => {
    if (!dateOfBirth) return undefined;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await authManager.updateProfile({
        name: formData.name,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        allergies: formData.allergies,
        medications: formData.medications,
        chronicConditions: formData.chronicConditions,
        emergencyContact: formData.emergencyContact.name ? formData.emergencyContact : undefined
      });

      if (result.success) {
        setCurrentUser(result.user);
        setIsEditing(false);
        onProfileUpdate?.(result.user);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = (type: 'allergies' | 'medications' | 'chronicConditions', value: string) => {
    if (!value.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], value.trim()]
    }));

    if (type === 'allergies') setNewAllergy('');
    if (type === 'medications') setNewMedication('');
    if (type === 'chronicConditions') setNewCondition('');
  };

  const removeItem = (type: 'allergies' | 'medications' | 'chronicConditions', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  // No Profile State - Now with Register/Login buttons
  if (!currentUser) {
    return (
      <div className="space-y-6 p-8 bg-black/20 rounded-lg border border-white/10">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center">
              <User className="size-8 text-gray-400" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-2">No Profile Found</h3>
          <p className="text-gray-300 mb-6 max-w-md mx-auto">
            Please register or log in to access personalized medical recommendations and track your health history.
          </p>
          
          {/* Register and Login Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-sm mx-auto mb-6">
            <Button
              onClick={onNavigateToRegister}
              className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 flex-1"
            >
              <UserPlus className="size-4" />
              Register
            </Button>
            
            <Button
              onClick={onNavigateToLogin}
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 flex-1"
            >
              <LogIn className="size-4" />
              Log In
            </Button>
          </div>
          
          <div className="mt-6 text-xs text-gray-400 space-y-1">
            <p>🔒 Your data stays private and secure</p>
            <p>✨ Get personalized care recommendations</p>
            <p>📊 Track your medical history and insights</p>
          </div>
        </div>
      </div>
    );
  }

  // Edit Profile Form - Already has scrolling
  if (isEditing) {
    return (
      <div className="h-full flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/30 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Edit className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Edit Profile</h3>
              <p className="text-sm text-gray-400">Update your medical information</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-white px-6"
            >
              <Save className="size-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
              className="text-white border-white/30 hover:bg-white/10 px-6"
            >
              Cancel
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-400/30 rounded text-red-200 text-sm mx-6 mt-4">
            {error}
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Personal Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-white/20">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <User className="size-4 text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold text-white">Personal Information</h4>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    className="bg-white/10 border-white/20 text-white h-11"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Date of Birth</label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white h-11"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Used to calculate age and provide age-appropriate recommendations
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full h-11 px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-white/20">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                <User className="size-4 text-red-400" />
              </div>
              <h4 className="text-lg font-semibold text-white">Emergency Contact</h4>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Contact Name</label>
                <Input
                  value={formData.emergencyContact.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                  }))}
                  placeholder="Emergency contact name"
                  className="bg-white/10 border-white/20 text-white h-11"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Phone Number</label>
                <Input
                  type="tel"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                  }))}
                  placeholder="Emergency contact phone"
                  className="bg-white/10 border-white/20 text-white h-11"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Relationship</label>
                <Input
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                  }))}
                  placeholder="e.g., Spouse, Parent, Sibling"
                  className="bg-white/10 border-white/20 text-white h-11"
                />
              </div>
            </div>
          </div>

          {/* Medical Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-white/20">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Plus className="size-4 text-green-400" />
              </div>
              <h4 className="text-lg font-semibold text-white">Medical Information</h4>
            </div>
            
            {/* Allergies */}
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-3">Known Allergies</label>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Input
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      placeholder="Add allergy (e.g., Penicillin, Peanuts, Shellfish)"
                      className="bg-white/10 border-white/20 text-white h-11"
                      onKeyPress={(e) => e.key === 'Enter' && addItem('allergies', newAllergy)}
                    />
                    <Button
                      onClick={() => addItem('allergies', newAllergy)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 h-11"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[2rem]">
                    {formData.allergies.map((allergy, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 text-sm">
                        <span>{allergy}</span>
                        <button 
                          onClick={() => removeItem('allergies', index)}
                          className="hover:bg-red-500/30 rounded-full p-1 transition-colors"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                    {formData.allergies.length === 0 && (
                      <p className="text-gray-400 text-sm italic">No allergies added yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Medications */}
              <div>
                <label className="block text-white text-sm font-medium mb-3">Current Medications</label>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Input
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      placeholder="Add medication (include dosage if known)"
                      className="bg-white/10 border-white/20 text-white h-11"
                      onKeyPress={(e) => e.key === 'Enter' && addItem('medications', newMedication)}
                    />
                    <Button
                      onClick={() => addItem('medications', newMedication)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 h-11"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[2rem]">
                    {formData.medications.map((medication, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-200 text-sm">
                        <span>{medication}</span>
                        <button 
                          onClick={() => removeItem('medications', index)}
                          className="hover:bg-blue-500/30 rounded-full p-1 transition-colors"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                    {formData.medications.length === 0 && (
                      <p className="text-gray-400 text-sm italic">No medications added yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Chronic Conditions */}
              <div>
                <label className="block text-white text-sm font-medium mb-3">Chronic Conditions</label>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Input
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      placeholder="Add chronic condition (e.g., Diabetes, Hypertension)"
                      className="bg-white/10 border-white/20 text-white h-11"
                      onKeyPress={(e) => e.key === 'Enter' && addItem('chronicConditions', newCondition)}
                    />
                    <Button
                      onClick={() => addItem('chronicConditions', newCondition)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 h-11"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[2rem]">
                    {formData.chronicConditions.map((condition, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 border border-orange-400/30 rounded-lg text-orange-200 text-sm">
                        <span>{condition}</span>
                        <button 
                          onClick={() => removeItem('chronicConditions', index)}
                          className="hover:bg-orange-500/30 rounded-full p-1 transition-colors"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                    {formData.chronicConditions.length === 0 && (
                      <p className="text-gray-400 text-sm italic">No chronic conditions added yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Information */}
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="size-3 text-blue-400" />
              </div>
              <div className="text-sm text-gray-300">
                <p className="font-medium text-white mb-1">Privacy & Security</p>
                <p>All your medical information is stored locally on your device and is never transmitted to external servers. This ensures your privacy and complies with healthcare data protection standards.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Display Profile - Now with scrolling support
  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/30 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <User className="size-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{currentUser.profile?.name || currentUser.name}</h3>
            <p className="text-sm text-gray-400">Medical Profile</p>
          </div>
        </div>
        <Button
          onClick={() => setIsEditing(true)}
          variant="outline"
          className="text-white border-white/30 hover:bg-white/10"
        >
          <Edit className="size-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-white font-medium mb-2">Basic Information</h4>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-300">Name:</span> <span className="text-white">{currentUser.profile?.name}</span></div>
              <div><span className="text-gray-300">Email:</span> <span className="text-white">{currentUser.email}</span></div>
              {currentUser.profile?.date_of_birth && (
                <>
                  <div>
                    <span className="text-gray-300">Age:</span> 
                    <span className="text-white ml-1">{calculateAge(currentUser.profile.date_of_birth)}</span>
                  </div>
                  <div>
                    <span className="text-gray-300">Date of Birth:</span> 
                    <span className="text-white ml-1">
                      {new Date(currentUser.profile.date_of_birth).toLocaleDateString()}
                    </span>
                  </div>
                </>
              )}
              {currentUser.profile?.gender && <div><span className="text-gray-300">Gender:</span> <span className="text-white">{currentUser.profile.gender}</span></div>}
            </div>
          </div>

          {currentUser.profile?.emergency_contact && (
            <div>
              <h4 className="text-white font-medium mb-2">Emergency Contact</h4>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-300">Name:</span> <span className="text-white">{currentUser.profile.emergency_contact.name}</span></div>
                <div><span className="text-gray-300">Phone:</span> <span className="text-white">{currentUser.profile.emergency_contact.phone}</span></div>
                <div><span className="text-gray-300">Relationship:</span> <span className="text-white">{currentUser.profile.emergency_contact.relationship}</span></div>
              </div>
            </div>
          )}
        </div>

        {currentUser.profile?.allergies?.length > 0 && (
          <div>
            <h4 className="text-white font-medium mb-2">Allergies</h4>
            <div className="flex flex-wrap gap-2">
              {currentUser.profile.allergies.map((allergy: string, index: number) => (
                <div key={index} className="px-3 py-1 bg-red-500/20 border border-red-400/30 rounded-full text-red-200 text-sm">
                  {allergy}
                </div>
              ))}
            </div>
          </div>
        )}

        {currentUser.profile?.medications?.length > 0 && (
          <div>
            <h4 className="text-white font-medium mb-2">Current Medications</h4>
            <div className="flex flex-wrap gap-2">
              {currentUser.profile.medications.map((medication: string, index: number) => (
                <div key={index} className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-200 text-sm">
                  {medication}
                </div>
              ))}
            </div>
          </div>
        )}

        {currentUser.profile?.chronic_conditions?.length > 0 && (
          <div>
            <h4 className="text-white font-medium mb-2">Chronic Conditions</h4>
            <div className="flex flex-wrap gap-2">
              {currentUser.profile.chronic_conditions.map((condition: string, index: number) => (
                <div key={index} className="px-3 py-1 bg-orange-500/20 border border-orange-400/30 rounded-full text-orange-200 text-sm">
                  {condition}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Health Insights Section (if available) */}
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="size-4 text-primary" />
            <h4 className="text-white font-medium">Health Summary</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-xl font-bold text-primary">0</div>
              <div className="text-gray-300">Total Visits</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-primary">--</div>
              <div className="text-gray-300">Avg Risk Score</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-primary">100</div>
              <div className="text-gray-300">Health Score</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-primary">0</div>
              <div className="text-gray-300">Records</div>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <User className="size-3 text-blue-400" />
            </div>
            <div className="text-sm text-gray-300">
              <p className="font-medium text-white mb-1">Privacy & Security</p>
              <p>All your medical information is stored locally on your device and is never transmitted to external servers. This ensures your privacy and complies with healthcare data protection standards.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};