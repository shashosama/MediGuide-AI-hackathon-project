import { localDatabase } from './localDatabase';
import bcrypt from 'bcryptjs';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  dateOfBirth?: string;
  gender?: string;
  allergies?: string[];
  medications?: string[];
  chronicConditions?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export class AuthManager {
  private static instance: AuthManager;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  async register(userData: RegisterData): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      // Check if user already exists
      const { data: existingUser } = await localDatabase.getUserByEmail(userData.email);

      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 10);

      // Create user credentials
      const { data: newUser, error: userError } = await localDatabase.createUser(userData.email, passwordHash);

      if (userError || !newUser) {
        return { success: false, error: userError || 'Failed to create user' };
      }

      // Create user profile
      const { data: newProfile, error: profileError } = await localDatabase.createProfile({
        email: userData.email,
        name: userData.name,
        date_of_birth: userData.dateOfBirth || undefined,
        gender: userData.gender || undefined,
        allergies: userData.allergies || [],
        medications: userData.medications || [],
        chronic_conditions: userData.chronicConditions || [],
        emergency_contact: userData.emergencyContact || undefined
      });

      if (profileError || !newProfile) {
        return { success: false, error: profileError || 'Failed to create profile' };
      }

      // Store user session
      localDatabase.setCurrentUser(newUser);
      
      return { success: true, user: { ...newUser, profile: newProfile } };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      // Get user by email
      const { data: user, error } = await localDatabase.getUserByEmail(credentials.email);

      if (error || !user) {
        return { success: false, error: 'No user found. Please register first.' };
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(credentials.password, user.password_hash);
      
      if (!passwordMatch) {
        return { success: false, error: 'Invalid password' };
      }

      // Get user profile
      const { data: profile } = await localDatabase.getProfileByEmail(credentials.email);

      // Store user session
      localDatabase.setCurrentUser(user);
      
      return { success: true, user: { ...user, profile } };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  async logout(): Promise<void> {
    localDatabase.clearCurrentUser();
  }

  getCurrentUser(): any | null {
    const user = localDatabase.getCurrentUser();
    if (!user) return null;

    // Get the user's profile as well
    return user;
  }

  async getCurrentUserWithProfile(): Promise<any | null> {
    const user = localDatabase.getCurrentUser();
    if (!user) return null;

    const { data: profile } = await localDatabase.getProfileByEmail(user.email);
    return { ...user, profile };
  }

  isLoggedIn(): boolean {
    return localDatabase.getCurrentUser() !== null;
  }

  async updateProfile(updates: Partial<RegisterData>): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const currentUser = localDatabase.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'No user logged in' };
      }

      // Get current profile
      const { data: currentProfile } = await localDatabase.getProfileByEmail(currentUser.email);
      if (!currentProfile) {
        return { success: false, error: 'Profile not found' };
      }

      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.dateOfBirth !== undefined) updateData.date_of_birth = updates.dateOfBirth;
      if (updates.gender !== undefined) updateData.gender = updates.gender;
      if (updates.allergies !== undefined) updateData.allergies = updates.allergies;
      if (updates.medications !== undefined) updateData.medications = updates.medications;
      if (updates.chronicConditions !== undefined) updateData.chronic_conditions = updates.chronicConditions;
      if (updates.emergencyContact !== undefined) updateData.emergency_contact = updates.emergencyContact;

      const { data: updatedProfile, error } = await localDatabase.updateProfile(currentProfile.id, updateData);

      if (error || !updatedProfile) {
        return { success: false, error: error || 'Failed to update profile' };
      }
      
      return { success: true, user: { ...currentUser, profile: updatedProfile } };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Profile update failed' };
    }
  }

  async getMedicalHistory(): Promise<any[]> {
    try {
      const currentUser = localDatabase.getCurrentUser();
      if (!currentUser) return [];

      // Get user profile to get the profile ID
      const { data: profile } = await localDatabase.getProfileByEmail(currentUser.email);
      if (!profile) return [];

      const { data: records } = await localDatabase.getMedicalRecordsByUserId(profile.id);
      
      return records.map(record => ({
        ...record,
        date: new Date(record.date),
        followUpDate: record.follow_up_date ? new Date(record.follow_up_date) : undefined
      }));
    } catch (error) {
      console.error('Error fetching medical history:', error);
      return [];
    }
  }

  async addMedicalRecord(record: {
    symptoms: string[];
    diagnosis?: string;
    department: string;
    riskLevel: string;
    riskScore: number;
    notes: string;
    followUpRequired: boolean;
    followUpDate?: Date;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = localDatabase.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'No user logged in' };
      }

      // Get user profile
      const { data: profile } = await localDatabase.getProfileByEmail(currentUser.email);
      if (!profile) {
        return { success: false, error: 'Profile not found' };
      }

      const { error } = await localDatabase.createMedicalRecord({
        user_id: profile.id,
        date: new Date().toISOString(),
        symptoms: record.symptoms,
        diagnosis: record.diagnosis || undefined,
        department: record.department,
        risk_level: record.riskLevel as 'low' | 'medium' | 'high' | 'critical',
        risk_score: record.riskScore,
        notes: record.notes,
        follow_up_required: record.followUpRequired,
        follow_up_date: record.followUpDate?.toISOString() || undefined
      });

      if (error) {
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding medical record:', error);
      return { success: false, error: 'Failed to save medical record' };
    }
  }
}

export const authManager = AuthManager.getInstance();