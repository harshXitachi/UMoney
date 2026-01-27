import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword } from 'firebase/auth';
import {
    getFirestore, collection, addDoc, doc, updateDoc, setDoc, getDoc,
    onSnapshot, query, where, orderBy, getDocs, serverTimestamp, Timestamp, limit
} from 'firebase/firestore';

// --- 🔴 CONFIGURATION STEP 🔴 ---
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- SYSTEM SETTINGS (ADMIN) ---

const DEFAULT_SETTINGS = {
    usdtRate: 102.0,
    maintenanceMode: false,
    // INR Deposit Settings
    adminUpi: "pay.umoney@upi",
    adminQrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=pay.umoney@upi",
    // USDT Deposit Settings
    usdtTrc20Address: "TVjsyZ7sWvJgM8p4G8MockTRC20Address7788",
    usdtQrCode: "",
    // Payment toggles
    inrPaymentEnabled: true,
    usdtPaymentEnabled: true
};

export const db_getSystemSettings = async () => {
    const snap = await getDoc(doc(db, 'system', 'settings'));
    if (snap.exists()) return snap.data();
    return DEFAULT_SETTINGS;
};

export const db_subscribeSystemSettings = (callback) => {
    return onSnapshot(doc(db, 'system', 'settings'), (doc) => {
        callback(doc.exists() ? doc.data() : DEFAULT_SETTINGS);
    });
};

export const db_updateSystemSettings = async (settings) => {
    return setDoc(doc(db, 'system', 'settings'), settings, { merge: true });
};

// --- AUTH SERVICES ---

export const auth_signIn = async (email, password) => {
    // Admin Bypass
    if (email === 'admin@gmail.com' && password === 'admin') {
        return { user: { uid: 'ADMIN_USER', email: 'admin@gmail.com' } };
    }

    return signInWithEmailAndPassword(auth, email, password);
};

export const auth_signUp = async (email, password, inviteCode) => {
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
    const newProfile = {
        uid, email, inrBalance: 0, usdtBalance: 0,
        referralCode: Math.random().toString(36).substring(7).toUpperCase(),
        referrerId: referrerId,
        createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', uid), newProfile);
    return userCredential;
};

export const auth_signOut = async () => {
    return signOut(auth);
};

export const auth_onStateChanged = (callback) => {
    return onAuthStateChanged(auth, callback);
};

export const auth_updateUserPassword = async (newPassword) => {
    if (auth.currentUser) return updatePassword(auth.currentUser, newPassword);
    throw new Error("No authenticated user found");
};

// --- DATABASE SERVICES ---

export const db_subscribeUserProfile = (uid, callback) => {
    return onSnapshot(doc(db, 'users', uid), (snap) => {
        if (snap.exists()) callback(snap.data());
        else callback(null);
    });
};

export const db_updateUserProfile = async (uid, data) => {
    return updateDoc(doc(db, 'users', uid), data);
};

export const db_ensureProfile = async (uid, email) => {
    if (uid === 'ADMIN_USER') return; // Admin has no profile

    // Determine location
    let loc = { ip: '192.168.1.1', city: 'Unknown', region: '', country: 'India' };
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data && !data.error) {
            loc = { ip: data.ip, city: data.city, region: data.region, country: data.country_name };
        }
    } catch (e) { }

    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        const newProfile = {
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
};

export const db_addTransaction = async (tx) => {
    return addDoc(collection(db, 'transactions'), { ...tx, date: serverTimestamp() });
};

export const db_getTransactions = async (uid, typeFilter) => {
    try {
        // Try with orderBy first (requires composite index)
        let q = query(collection(db, 'transactions'), where('userId', '==', uid), orderBy('date', 'desc'));
        const snap = await getDocs(q);
        let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (typeFilter) {
            if (typeFilter === 'DEPOSIT') data = data.filter(t => t.type.includes('DEPOSIT'));
            else data = data.filter(t => t.type === typeFilter);
        }
        return data;
    } catch (e) {
        // Fallback: query without orderBy if index doesn't exist yet
        console.warn('Index may be missing, using fallback query:', e.message);
        let q = query(collection(db, 'transactions'), where('userId', '==', uid));
        const snap = await getDocs(q);
        let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (typeFilter) {
            if (typeFilter === 'DEPOSIT') data = data.filter(t => t.type.includes('DEPOSIT'));
            else data = data.filter(t => t.type === typeFilter);
        }
        // Sort in JS instead
        data.sort((a, b) => {
            const aTime = a.date?.seconds || 0;
            const bTime = b.date?.seconds || 0;
            return bTime - aTime;
        });
        return data;
    }
};

// --- ADMIN SPECIFIC DB FUNCTIONS ---

export const db_getAllTransactions = async () => {
    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const db_getAllUsers = async () => {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => d.data());
};

export const db_adminProcessTransaction = async (txId, action) => {
    const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    // Fetch transaction first to get details
    let tx = null;
    const txDoc = await getDoc(doc(db, 'transactions', txId));
    if (txDoc.exists()) tx = { id: txDoc.id, ...txDoc.data() };

    if (!tx || tx.status !== 'PENDING') return;

    // 1. Update Transaction
    await updateDoc(doc(db, 'transactions', txId), { status });

    // 2. Update User Balance (If Approved)
    if (action === 'APPROVE') {
        const userRef = doc(db, 'users', tx.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const user = userSnap.data();

            if (tx.type.includes('DEPOSIT')) {
                // For USDT deposits, use amountInr (converted value)
                // For INR deposits, use amount directly
                const creditAmount = tx.amountInr || tx.amount;
                await updateDoc(userRef, { inrBalance: user.inrBalance + creditAmount });
            } else if (tx.type === 'WITHDRAW') {
                await updateDoc(userRef, { inrBalance: user.inrBalance - tx.amount });
            }
        }
    }
};

export const db_banUser = async (uid, durationSeconds) => {
    // If durationSeconds is -1, it's permanent (e.g., 100 years)
    const expiry = durationSeconds === -1 ? Date.now() + 3153600000000 : Date.now() + (durationSeconds * 1000);

    await db_updateUserProfile(uid, { isBanned: true, banExpires: expiry });
};

export const db_unbanUser = async (uid) => {
    await db_updateUserProfile(uid, { isBanned: false, banExpires: 0 });
};

// Clear all admin data (transactions) while preserving users
export const db_clearAdminData = async () => {
    const transactionsQuery = query(collection(db, 'transactions'));
    const snapshot = await getDocs(transactionsQuery);

    const deletePromises = [];
    snapshot.docs.forEach((docSnapshot) => {
        deletePromises.push(updateDoc(doc(db, 'transactions', docSnapshot.id), {
            status: 'CLEARED',
            clearedAt: serverTimestamp()
        }));
    });

    // Using batch-style deletion by marking as cleared
    // For actual deletion, we'd need Firebase Admin SDK or Cloud Functions
    await Promise.all(deletePromises);
    return { clearedCount: snapshot.docs.length };
};

// --- TEAM SERVICES ---

const chunkArray = (arr, size) => {
    const results = [];
    while (arr.length) { results.push(arr.splice(0, size)); }
    return results;
};

export const db_getTeamData = async (uid) => {
    let level1Users = [];
    let level2Users = [];
    let level3Users = [];
    const l1Query = query(collection(db, 'users'), where('referrerId', '==', uid));
    const l1Snap = await getDocs(l1Query);
    l1Snap.forEach(d => level1Users.push(d.data()));
    const l1Ids = level1Users.map(u => u.uid);

    if (l1Ids.length > 0) {
        const chunks = chunkArray([...l1Ids], 10);
        for (const chunk of chunks) {
            const l2Query = query(collection(db, 'users'), where('referrerId', 'in', chunk));
            const l2Snap = await getDocs(l2Query);
            l2Snap.forEach(d => level2Users.push(d.data()));
        }
    }
    const l2Ids = level2Users.map(u => u.uid);

    if (l2Ids.length > 0) {
        const chunks = chunkArray([...l2Ids], 10);
        for (const chunk of chunks) {
            const l3Query = query(collection(db, 'users'), where('referrerId', 'in', chunk));
            const l3Snap = await getDocs(l3Query);
            l3Snap.forEach(d => level3Users.push(d.data()));
        }
    }
    const l1Count = level1Users.length;
    const l2Count = level2Users.length;
    const l3Count = level3Users.length;
    const l1Comm = l1Count * 50;
    const l2Comm = l2Count * 25;
    const l3Comm = l3Count * 10;
    const totalCommission = l1Comm + l2Comm + l3Comm;
    const members = [
        { id: 'l1', level: 1, count: l1Count, rate: '10%', amount: l1Comm },
        { id: 'l2', level: 2, count: l2Count, rate: '5%', amount: l2Comm },
        { id: 'l3', level: 3, count: l3Count, rate: '2%', amount: l3Comm },
    ];
    const stats = {
        todayDeposit: 0,
        totalDeposit: 0,
        totalCommission: totalCommission,
        commissionYesterday: 0,
        teamCount: l1Count + l2Count + l3Count,
        commissionToday: 0,
        todayNewTeam: 0
    };
    return { stats, members };
};
