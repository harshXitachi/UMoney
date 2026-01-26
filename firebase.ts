import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword } from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, doc, updateDoc, setDoc, getDoc, 
  onSnapshot, query, where, orderBy, getDocs, serverTimestamp, Timestamp, limit 
} from 'firebase/firestore';
import { Transaction, UserProfile, DashboardStats, TeamMember, SystemSettings } from './types';

// --- 🔴 CONFIGURATION STEP 🔴 ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", 
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

let app, auth: any, db: any;
if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.error("Firebase Init Error:", e);
  }
} else {
    console.warn("⚠️ No Valid Firebase Config found. Running in SIMULATION MODE (Local Storage).");
}

// --- SYSTEM SETTINGS (ADMIN) ---

const DEFAULT_SETTINGS: SystemSettings = {
    usdtRate: 102.0,
    maintenanceMode: false,
    adminUpi: "pay.umoney@upi",
    adminQrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=pay.umoney@upi",
    inrPaymentEnabled: true,
    usdtPaymentEnabled: true
};

export const db_getSystemSettings = async (): Promise<SystemSettings> => {
    if (isConfigured && db) {
        const snap = await getDoc(doc(db, 'system', 'settings'));
        if (snap.exists()) return snap.data() as SystemSettings;
        return DEFAULT_SETTINGS;
    }
    // Simulation
    const settings = localStorage.getItem('mock_system_settings');
    return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
};

export const db_subscribeSystemSettings = (callback: (s: SystemSettings) => void) => {
    if (isConfigured && db) {
        return onSnapshot(doc(db, 'system', 'settings'), (doc) => {
            callback(doc.exists() ? doc.data() as SystemSettings : DEFAULT_SETTINGS);
        });
    }
    // Simulation Poll
    const interval = setInterval(() => {
        const settings = localStorage.getItem('mock_system_settings');
        callback(settings ? JSON.parse(settings) : DEFAULT_SETTINGS);
    }, 2000);
    return () => clearInterval(interval);
};

export const db_updateSystemSettings = async (settings: Partial<SystemSettings>) => {
    if (isConfigured && db) {
        return setDoc(doc(db, 'system', 'settings'), settings, { merge: true });
    }
    // Simulation
    const current = await db_getSystemSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem('mock_system_settings', JSON.stringify(updated));
    return updated;
};

// --- AUTH SERVICES ---

export const auth_signIn = async (email: string, password: string): Promise<any> => {
  // Admin Bypass
  if (email === 'admin@gmail.com' && password === 'admin') {
      return { user: { uid: 'ADMIN_USER', email: 'admin@gmail.com' } };
  }

  if (isConfigured && auth) {
      return signInWithEmailAndPassword(auth, email, password);
  }
  
  // SIMULATION MODE
  await new Promise(r => setTimeout(r, 800)); 
  const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
  const user = users.find((u: any) => u.email === email && u.password === password);
  
  if (!user) throw new Error("User not found or invalid password (SIMULATION)");
  
  const token = { uid: user.uid, email: user.email };
  localStorage.setItem('mock_session', JSON.stringify(token));
  window.dispatchEvent(new Event('mock-auth-change'));
  return { user: token };
};

export const auth_signUp = async (email: string, password: string, inviteCode?: string): Promise<any> => {
  if (isConfigured && auth) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      let referrerId = undefined;
      if (inviteCode) {
          try {
            const q = query(collection(db, 'users'), where('referralCode', '==', inviteCode));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) referrerId = querySnapshot.docs[0].id;
          } catch (err) { console.error(err); }
      }
      const newProfile: UserProfile = {
        uid, email, inrBalance: 0, usdtBalance: 0,
        referralCode: Math.random().toString(36).substring(7).toUpperCase(),
        referrerId: referrerId,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', uid), newProfile);
      return userCredential;
  }

  // SIMULATION MODE
  await new Promise(r => setTimeout(r, 800));
  const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
  if (users.find((u: any) => u.email === email)) throw new Error("Email already in use");
  
  const uid = 'user_' + Math.random().toString(36).substr(2, 9);
  let referrerId = undefined;
  if (inviteCode) {
      const profiles = JSON.parse(localStorage.getItem('mock_profiles') || '{}');
      const referrer = Object.values(profiles).find((p: any) => p.referralCode === inviteCode) as UserProfile | undefined;
      if (referrer) referrerId = referrer.uid;
  }

  const newUser = { uid, email, password };
  users.push(newUser);
  localStorage.setItem('mock_users', JSON.stringify(users));
  
  const profiles = JSON.parse(localStorage.getItem('mock_profiles') || '{}');
  const newProfile: UserProfile = {
      uid, email, inrBalance: 0, usdtBalance: 0,
      referralCode: Math.random().toString(36).substring(7).toUpperCase(),
      referrerId: referrerId,
      createdAt: new Date().toISOString()
  };
  profiles[uid] = newProfile;
  localStorage.setItem('mock_profiles', JSON.stringify(profiles));

  const token = { uid, email };
  localStorage.setItem('mock_session', JSON.stringify(token));
  window.dispatchEvent(new Event('mock-auth-change'));
  window.dispatchEvent(new Event('mock-db-change'));
  return { user: token };
};

export const auth_signOut = async () => {
  if (isConfigured && auth) return signOut(auth);
  localStorage.removeItem('mock_session');
  window.dispatchEvent(new Event('mock-auth-change'));
};

export const auth_onStateChanged = (callback: (user: any) => void) => {
  if (isConfigured && auth) return onAuthStateChanged(auth, callback);
  const check = () => {
      const session = localStorage.getItem('mock_session');
      callback(session ? JSON.parse(session) : null);
  };
  window.addEventListener('mock-auth-change', check);
  check(); 
  return () => window.removeEventListener('mock-auth-change', check);
};

export const auth_updateUserPassword = async (newPassword: string) => {
    if (isConfigured && auth && auth.currentUser) return updatePassword(auth.currentUser, newPassword);
    await new Promise(r => setTimeout(r, 600));
    return;
};

// --- DATABASE SERVICES ---

export const db_subscribeUserProfile = (uid: string, callback: (profile: UserProfile | null) => void) => {
  if (isConfigured && db) {
      return onSnapshot(doc(db, 'users', uid), (snap) => {
          if (snap.exists()) callback(snap.data() as UserProfile);
          else callback(null);
      });
  }
  const check = () => {
      const profiles = JSON.parse(localStorage.getItem('mock_profiles') || '{}');
      callback(profiles[uid] || null);
  };
  window.addEventListener('mock-db-change', check);
  check();
  return () => window.removeEventListener('mock-db-change', check);
};

export const db_updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
    if (isConfigured && db) {
        return updateDoc(doc(db, 'users', uid), data);
    }
    await new Promise(r => setTimeout(r, 500));
    const profiles = JSON.parse(localStorage.getItem('mock_profiles') || '{}');
    if (profiles[uid]) {
        profiles[uid] = { ...profiles[uid], ...data };
        localStorage.setItem('mock_profiles', JSON.stringify(profiles));
        window.dispatchEvent(new Event('mock-db-change'));
    }
};

export const db_ensureProfile = async (uid: string, email: string) => {
    if(uid === 'ADMIN_USER') return; // Admin has no profile
    
    // Determine location mock
    let loc = { ip: '192.168.1.1', city: 'Unknown', region: '', country: 'India' };
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if(data && !data.error) {
            loc = { ip: data.ip, city: data.city, region: data.region, country: data.country_name };
        }
    } catch(e) {}

    if(isConfigured && db) {
        const ref = doc(db, 'users', uid);
        const snap = await getDoc(ref);
        if(!snap.exists()) {
             const newProfile: UserProfile = {
                uid, email, inrBalance: 0, usdtBalance: 0,
                referralCode: Math.random().toString(36).substring(7).toUpperCase(),
                createdAt: new Date().toISOString(),
                lastLocation: loc
            };
            await setDoc(ref, newProfile);
        } else {
            // Update location on ensure
            await updateDoc(ref, { lastLocation: loc });
        }
        return; 
    }
    // Simulation
    const profiles = JSON.parse(localStorage.getItem('mock_profiles') || '{}');
    if(!profiles[uid]) {
        profiles[uid] = {
            uid, email, inrBalance: 0, usdtBalance: 0,
            referralCode: Math.random().toString(36).substring(7).toUpperCase(),
            createdAt: new Date().toISOString(),
            lastLocation: loc
        };
        localStorage.setItem('mock_profiles', JSON.stringify(profiles));
    } else {
        profiles[uid].lastLocation = loc;
        localStorage.setItem('mock_profiles', JSON.stringify(profiles));
    }
    window.dispatchEvent(new Event('mock-db-change'));
};

export const db_addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    if(isConfigured && db) {
        return addDoc(collection(db, 'transactions'), { ...tx, date: serverTimestamp() });
    }
    await new Promise(r => setTimeout(r, 600));
    const txs = JSON.parse(localStorage.getItem('mock_txs') || '[]');
    const newTx = { ...tx, id: 'tx_' + Date.now(), date: { seconds: Date.now()/1000 } };
    txs.push(newTx);
    localStorage.setItem('mock_txs', JSON.stringify(txs));
    window.dispatchEvent(new Event('mock-db-change'));
    return newTx;
};

export const db_getTransactions = async (uid: string, typeFilter?: string) => {
    if(isConfigured && db) {
        let q = query(collection(db, 'transactions'), where('userId', '==', uid), orderBy('date', 'desc'));
        const snap = await getDocs(q);
        let data = snap.docs.map(d => ({id: d.id, ...d.data()} as Transaction));
        if(typeFilter) {
            if (typeFilter === 'DEPOSIT') data = data.filter(t => t.type.includes('DEPOSIT'));
            else data = data.filter(t => t.type === typeFilter);
        }
        return data;
    }
    await new Promise(r => setTimeout(r, 500));
    const txs = JSON.parse(localStorage.getItem('mock_txs') || '[]');
    let userTxs = txs.filter((t: any) => t.userId === uid).sort((a: any, b: any) => b.date.seconds - a.date.seconds);
    if(typeFilter) {
        if (typeFilter === 'DEPOSIT') userTxs = userTxs.filter((t: any) => t.type.includes('DEPOSIT'));
        else userTxs = userTxs.filter((t: any) => t.type === typeFilter);
    }
    return userTxs;
};

// --- ADMIN SPECIFIC DB FUNCTIONS ---

export const db_getAllTransactions = async (): Promise<Transaction[]> => {
    if(isConfigured && db) {
        const q = query(collection(db, 'transactions'), orderBy('date', 'desc'), limit(100));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({id: d.id, ...d.data()} as Transaction));
    }
    // Simulation
    const txs = JSON.parse(localStorage.getItem('mock_txs') || '[]');
    return txs.sort((a: any, b: any) => b.date.seconds - a.date.seconds);
};

export const db_getAllUsers = async (): Promise<UserProfile[]> => {
    if(isConfigured && db) {
        const snap = await getDocs(collection(db, 'users'));
        return snap.docs.map(d => d.data() as UserProfile);
    }
    const profiles = JSON.parse(localStorage.getItem('mock_profiles') || '{}');
    return Object.values(profiles);
};

export const db_adminProcessTransaction = async (txId: string, action: 'APPROVE' | 'REJECT') => {
    const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    
    // Fetch transaction first to get details
    let tx: Transaction | null = null;
    if(isConfigured && db) {
        const txDoc = await getDoc(doc(db, 'transactions', txId));
        if(txDoc.exists()) tx = {id: txDoc.id, ...txDoc.data()} as Transaction;
    } else {
        const txs = JSON.parse(localStorage.getItem('mock_txs') || '[]');
        tx = txs.find((t: any) => t.id === txId) || null;
    }

    if (!tx || tx.status !== 'PENDING') return;

    if (isConfigured && db) {
        // 1. Update Transaction
        await updateDoc(doc(db, 'transactions', txId), { status });
        
        // 2. Update User Balance (If Approved)
        if (action === 'APPROVE') {
            const userRef = doc(db, 'users', tx.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const user = userSnap.data() as UserProfile;
                
                if (tx.type.includes('DEPOSIT')) {
                    // Credit Balance
                    await updateDoc(userRef, { inrBalance: user.inrBalance + tx.amount });
                } else if (tx.type === 'WITHDRAW') {
                    // Withdraw already deducted balance on create? 
                    // Usually yes. But if we implemented it as "Pending deducts later", we do it here.
                    // Checking Home.tsx: Withdraw checks balance but doesn't deduct from Profile state in DB instantly?
                    // Home.tsx `handleWithdrawSubmit` only adds Transaction. It does NOT update `inrBalance`.
                    // FIX: We must deduct balance now on approval.
                    await updateDoc(userRef, { inrBalance: user.inrBalance - tx.amount });
                }
            }
        }
    } else {
        // Simulation
        const txs = JSON.parse(localStorage.getItem('mock_txs') || '[]');
        const txIndex = txs.findIndex((t: any) => t.id === txId);
        if (txIndex > -1) {
            txs[txIndex].status = status;
            localStorage.setItem('mock_txs', JSON.stringify(txs));

            if (action === 'APPROVE') {
                const profiles = JSON.parse(localStorage.getItem('mock_profiles') || '{}');
                const user = profiles[tx.userId];
                if (user) {
                    if (tx.type.includes('DEPOSIT')) {
                         user.inrBalance += tx.amount;
                    } else if (tx.type === 'WITHDRAW') {
                         user.inrBalance -= tx.amount;
                    }
                    localStorage.setItem('mock_profiles', JSON.stringify(profiles));
                }
            }
        }
        window.dispatchEvent(new Event('mock-db-change'));
    }
};

export const db_banUser = async (uid: string, durationSeconds: number) => {
    // If durationSeconds is -1, it's permanent (e.g., 100 years)
    const expiry = durationSeconds === -1 ? Date.now() + 3153600000000 : Date.now() + (durationSeconds * 1000);
    
    await db_updateUserProfile(uid, { isBanned: true, banExpires: expiry });
};

export const db_unbanUser = async (uid: string) => {
    await db_updateUserProfile(uid, { isBanned: false, banExpires: 0 });
};

// --- TEAM SERVICES ---

const chunkArray = (arr: string[], size: number) => {
    const results = [];
    while (arr.length) { results.push(arr.splice(0, size)); }
    return results;
};

export const db_getTeamData = async (uid: string): Promise<{ stats: DashboardStats, members: TeamMember[] }> => {
    if (isConfigured && db) {
        let level1Users: UserProfile[] = [];
        let level2Users: UserProfile[] = [];
        let level3Users: UserProfile[] = [];
        const l1Query = query(collection(db, 'users'), where('referrerId', '==', uid));
        const l1Snap = await getDocs(l1Query);
        l1Snap.forEach(d => level1Users.push(d.data() as UserProfile));
        const l1Ids = level1Users.map(u => u.uid);

        if (l1Ids.length > 0) {
            const chunks = chunkArray([...l1Ids], 10);
            for (const chunk of chunks) {
                const l2Query = query(collection(db, 'users'), where('referrerId', 'in', chunk));
                const l2Snap = await getDocs(l2Query);
                l2Snap.forEach(d => level2Users.push(d.data() as UserProfile));
            }
        }
        const l2Ids = level2Users.map(u => u.uid);

        if (l2Ids.length > 0) {
            const chunks = chunkArray([...l2Ids], 10);
            for (const chunk of chunks) {
                const l3Query = query(collection(db, 'users'), where('referrerId', 'in', chunk));
                const l3Snap = await getDocs(l3Query);
                l3Snap.forEach(d => level3Users.push(d.data() as UserProfile));
            }
        }
        const l1Count = level1Users.length;
        const l2Count = level2Users.length;
        const l3Count = level3Users.length;
        const l1Comm = l1Count * 50; 
        const l2Comm = l2Count * 25;
        const l3Comm = l3Count * 10;
        const totalCommission = l1Comm + l2Comm + l3Comm;
        const members: TeamMember[] = [
            { id: 'l1', level: 1, count: l1Count, rate: '10%', amount: l1Comm },
            { id: 'l2', level: 2, count: l2Count, rate: '5%', amount: l2Comm },
            { id: 'l3', level: 3, count: l3Count, rate: '2%', amount: l3Comm },
        ];
        const stats: DashboardStats = {
            todayDeposit: 0, 
            totalDeposit: 0,
            totalCommission: totalCommission,
            commissionYesterday: 0,
            teamCount: l1Count + l2Count + l3Count,
            commissionToday: 0,
            todayNewTeam: 0 
        };
        return { stats, members };
    }

    // SIMULATION MODE
    await new Promise(r => setTimeout(r, 600));
    const profiles = JSON.parse(localStorage.getItem('mock_profiles') || '{}');
    const transactions = JSON.parse(localStorage.getItem('mock_txs') || '[]');
    const allUsers = Object.values(profiles) as UserProfile[];
    const getUserDeposit = (userId: string) => {
        return transactions
            .filter((t: any) => t.userId === userId && t.type.includes('DEPOSIT'))
            .reduce((sum: number, t: any) => sum + (t.amountInr || t.amount), 0);
    };
    const level1Users = allUsers.filter(u => u.referrerId === uid);
    const level1Ids = level1Users.map(u => u.uid);
    const level2Users = allUsers.filter(u => u.referrerId && level1Ids.includes(u.referrerId));
    const level2Ids = level2Users.map(u => u.uid);
    const level3Users = allUsers.filter(u => u.referrerId && level2Ids.includes(u.referrerId));
    const l1DepositTotal = level1Users.reduce((sum, u) => sum + getUserDeposit(u.uid), 0);
    const l2DepositTotal = level2Users.reduce((sum, u) => sum + getUserDeposit(u.uid), 0);
    const l3DepositTotal = level3Users.reduce((sum, u) => sum + getUserDeposit(u.uid), 0);
    const l1Comm = l1DepositTotal * 0.10;
    const l2Comm = l2DepositTotal * 0.05;
    const l3Comm = l3DepositTotal * 0.02;
    const totalCommission = l1Comm + l2Comm + l3Comm;
    const totalTeamDeposit = l1DepositTotal + l2DepositTotal + l3DepositTotal;
    const members: TeamMember[] = [
        { id: 'l1', level: 1, count: level1Users.length, rate: '10%', amount: l1Comm },
        { id: 'l2', level: 2, count: level2Users.length, rate: '5%', amount: l2Comm },
        { id: 'l3', level: 3, count: level3Users.length, rate: '2%', amount: l3Comm },
    ];
    const stats: DashboardStats = {
        todayDeposit: totalTeamDeposit * 0.1,
        totalDeposit: totalTeamDeposit,
        totalCommission: totalCommission,
        commissionYesterday: totalCommission * 0.05,
        teamCount: level1Users.length + level2Users.length + level3Users.length,
        commissionToday: totalCommission * 0.02,
        todayNewTeam: 0 
    };
    return { stats, members };
};