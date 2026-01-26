import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth_onStateChanged, db_subscribeUserProfile, db_ensureProfile, db_subscribeSystemSettings, auth_signOut } from '../firebase.js';

const AuthContext = createContext({
  currentUser: null,
  userProfile: null,
  systemSettings: null,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider= ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [systemSettings, setSystemSettings] = useState(null);
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
    let profileUnsubscribe = () => {};

    const authUnsubscribe = auth_onStateChanged(async (user) => {
      // Clean up previous profile subscription
      profileUnsubscribe();

      if (user) {
        setCurrentUser(user);

        if (user.email === 'admin@gmail.com') {
          setIsAdmin(true);
          setUserProfile(null);
          setLoading(false);
        } else {
          setIsAdmin(false);
          try {
            await db_ensureProfile(user.uid, user.email || '');
            profileUnsubscribe = db_subscribeUserProfile(user.uid, (profile) => {
              if (profile?.isBanned && profile.banExpires && Date.now() < profile.banExpires) {
                alert("Your account has been banned by the administrator.");
                auth_signOut();
                return;
              }
              setUserProfile(profile);
              setLoading(false);
            });
          } catch (error) {
            console.error("Error ensuring profile or subscribing:", error);
            setUserProfile(null);
            setLoading(false);
          }
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    // Cleanup function for the effect
    return () => {
      authUnsubscribe();
      profileUnsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, systemSettings, loading, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};