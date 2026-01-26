import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth_onStateChanged, db_subscribeUserProfile, db_ensureProfile, db_subscribeSystemSettings, auth_signOut } from '../firebase';
import { UserProfile, SystemSettings } from '../types';

interface AuthContextType {
  currentUser: any | null;
  userProfile: UserProfile | null;
  systemSettings: SystemSettings | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  systemSettings: null,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load System Settings Global
  useEffect(() => {
     const unsub = db_subscribeSystemSettings((settings) => {
         setSystemSettings(settings);
     });
     return () => unsub();
  }, []);

  useEffect(() => {
    // Subscribe to Auth Changes
    const unsubscribe = auth_onStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Admin Check
        if (user.email === 'admin@gmail.com') {
            setIsAdmin(true);
            setUserProfile(null); // Admin doesn't need user profile
            setLoading(false);
            return;
        } else {
            setIsAdmin(false);
        }

        // Ensure profile exists 
        await db_ensureProfile(user.uid, user.email || '');
        
        // Subscribe to Profile
        const unsubProfile = db_subscribeUserProfile(user.uid, (profile) => {
            // Ban Check
            if (profile?.isBanned && profile.banExpires) {
                if (Date.now() < profile.banExpires) {
                    alert("Your account has been banned by the administrator.");
                    auth_signOut();
                    return;
                }
            }
            setUserProfile(profile);
            setLoading(false);
        });
        
        return () => unsubProfile();
      } else {
        setUserProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => {
        if(typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, systemSettings, loading, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};