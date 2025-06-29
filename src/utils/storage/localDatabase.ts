// Local database implementation using browser storage
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  date_of_birth?: string;
  gender?: string;
  allergies: string[];
  medications: string[];
  chronic_conditions: string[];
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: string;
  user_id: string;
  date: string;
  symptoms: string[];
  diagnosis?: string;
  department: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  notes: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  created_at: string;
}

export interface UserCredentials {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

class LocalDatabase {
  private static instance: LocalDatabase;
  private readonly USERS_KEY = 'medical_app_users';
  private readonly PROFILES_KEY = 'medical_app_profiles';
  private readonly RECORDS_KEY = 'medical_app_records';
  private readonly CURRENT_USER_KEY = 'medical_app_current_user';

  static getInstance(): LocalDatabase {
    if (!LocalDatabase.instance) {
      LocalDatabase.instance = new LocalDatabase();
    }
    return LocalDatabase.instance;
  }

  // User Authentication
  async createUser(email: string, passwordHash: string): Promise<{ data: UserCredentials | null; error: string | null }> {
    try {
      const users = this.getUsers();
      
      // Check if user already exists
      if (users.find(u => u.email === email)) {
        return { data: null, error: 'User with this email already exists' };
      }

      const newUser: UserCredentials = {
        id: this.generateId(),
        email,
        password_hash: passwordHash,
        created_at: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

      return { data: newUser, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to create user' };
    }
  }

  async getUserByEmail(email: string): Promise<{ data: UserCredentials | null; error: string | null }> {
    try {
      const users = this.getUsers();
      const user = users.find(u => u.email === email);
      
      if (!user) {
        return { data: null, error: 'User not found' };
      }

      return { data: user, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to get user' };
    }
  }

  // User Profiles
  async createProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: UserProfile | null; error: string | null }> {
    try {
      const profiles = this.getProfiles();
      
      const newProfile: UserProfile = {
        ...profile,
        id: this.generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      profiles.push(newProfile);
      localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles));

      return { data: newProfile, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to create profile' };
    }
  }

  async getProfileByEmail(email: string): Promise<{ data: UserProfile | null; error: string | null }> {
    try {
      const profiles = this.getProfiles();
      const profile = profiles.find(p => p.email === email);
      
      return { data: profile || null, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to get profile' };
    }
  }

  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<{ data: UserProfile | null; error: string | null }> {
    try {
      const profiles = this.getProfiles();
      const index = profiles.findIndex(p => p.id === id);
      
      if (index === -1) {
        return { data: null, error: 'Profile not found' };
      }

      profiles[index] = {
        ...profiles[index],
        ...updates,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles));
      return { data: profiles[index], error: null };
    } catch (error) {
      return { data: null, error: 'Failed to update profile' };
    }
  }

  // Medical Records
  async createMedicalRecord(record: Omit<MedicalRecord, 'id' | 'created_at'>): Promise<{ data: MedicalRecord | null; error: string | null }> {
    try {
      const records = this.getMedicalRecords();
      
      const newRecord: MedicalRecord = {
        ...record,
        id: this.generateId(),
        created_at: new Date().toISOString()
      };

      records.push(newRecord);
      localStorage.setItem(this.RECORDS_KEY, JSON.stringify(records));

      return { data: newRecord, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to create medical record' };
    }
  }

  async getMedicalRecordsByUserId(userId: string): Promise<{ data: MedicalRecord[]; error: string | null }> {
    try {
      const records = this.getMedicalRecords();
      const userRecords = records.filter(r => r.user_id === userId);
      
      return { data: userRecords, error: null };
    } catch (error) {
      return { data: [], error: 'Failed to get medical records' };
    }
  }

  // Session Management
  setCurrentUser(user: UserCredentials): void {
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
  }

  getCurrentUser(): UserCredentials | null {
    const stored = localStorage.getItem(this.CURRENT_USER_KEY);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  clearCurrentUser(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  // Private helper methods
  private getUsers(): UserCredentials[] {
    const stored = localStorage.getItem(this.USERS_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  private getProfiles(): UserProfile[] {
    const stored = localStorage.getItem(this.PROFILES_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  private getMedicalRecords(): MedicalRecord[] {
    const stored = localStorage.getItem(this.RECORDS_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Clear all data (for testing/reset)
  clearAllData(): void {
    localStorage.removeItem(this.USERS_KEY);
    localStorage.removeItem(this.PROFILES_KEY);
    localStorage.removeItem(this.RECORDS_KEY);
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }
}

export const localDatabase = LocalDatabase.getInstance();