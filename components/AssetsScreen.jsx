import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth_signOut, db_getTransactions, auth_updateUserPassword, db_ensureProfile } from '../firebase.js';

// FAQ Data organized by category
const faqData = {
    'Account & Registration': [
        {
            question: 'Is this platform safe and trustworthy?',
            shortAnswer: 'Yes. Our platform is well recognized in the market.',
            fullAnswer: 'Yes. Our platform is well recognized in the market, and many users have successfully received their earnings.'
        },
        {
            question: 'How do I get started?',
            shortAnswer: 'Simply register an account and follow the guidance.',
            fullAnswer: 'Simply register an account and follow the guidance from our support team. We\'ll walk you through every step.'
        },
        {
            question: 'Do I need real-name verification to register?',
            shortAnswer: 'No, but you need to link your Telegram account.',
            fullAnswer: 'No, but you need to link your Telegram account to protect your funds and ensure the security of your withdrawals.'
        },
        {
            question: 'Can one phone number register multiple accounts?',
            shortAnswer: 'No. One phone number can only register one account.',
            fullAnswer: 'No. One phone number can only be used to register and bind one UMONEY account. The system does not support using the same number for multiple accounts. Please avoid duplicate registrations to prevent account issues.'
        }
    ],
    'Orders & Earnings': [
        {
            question: 'What happens if an order fails?',
            shortAnswer: 'Check wallet connection, payment amount, and operation steps.',
            fullAnswer: 'If an order fails, it is usually due to one of the following reasons:\n\n• The user canceled the order manually\n• The order was not completed according to our platform\'s step-by-step instructions\n• There was a payment shortfall in the wallet\n• The wrong wallet payment method was used\n• The TOOLS is not linked to Umoney / Not Online\n\n⚠️ Any of the above will result in a failed order. If none of these apply to your case, please contact our customer service team for further assistance.'
        },
        {
            question: 'Order doesn\'t show as successful after payment?',
            shortAnswer: 'Contact Telegram support with order details and payment proof.',
            fullAnswer: 'Please contact our Telegram support immediately and provide the following:\n\n1. Your Umoney ID\n2. Photo Of The Order – Must clearly show: Order number, Date/Time, Recipient Account, IFSC, and UTR\n3. Video Proof Of Payment Invoice – Must clearly show: UPI ID, Payment History, Payment Status, Recipient Account, IFSC, and UTR'
        },
        {
            question: 'How much can I earn?',
            shortAnswer: 'Earnings depend on your activity and referrals.',
            fullAnswer: 'Your earnings depend on your activity and how many people you invite who join and deposit. The more active you are, the more you can earn.'
        },
        {
            question: 'How can I upgrade my account level?',
            shortAnswer: 'Complete orders, stay active, and invite friends.',
            fullAnswer: 'Completing orders regularly, staying active, and inviting friends can help you increase your level.'
        },
        {
            question: 'When will the commission be credited?',
            shortAnswer: 'Usually issued automatically after order completion.',
            fullAnswer: 'Commission is usually issued automatically shortly after the order is completed. If there is any delay, please contact customer support.'
        }
    ],
    'Withdrawals': [
        {
            question: 'My withdrawal is not working. What should I do?',
            shortAnswer: 'Check withdrawal button, tools running, and place 2 orders.',
            fullAnswer: 'Follow these steps:\n\n✅ Make sure your withdrawal button is ON\n✅ Keep all tools running\n✅ Restart your phone and open the app again\n✅ Use the wallet already linked and activated in Umoney to place TWO orders\n\nIf withdrawal shows "Expired / Offline", the payment failed — follow the diagnosis steps:\n\n🔧 Diagnosis Steps:\n• Restart your phone\n• Check tool status in the app\n• Turn OFF the withdrawal button for 2 minutes, then turn it ON\n• Ask a friend to send ₹3 to each of your UPI IDs (to verify they\'re active)\n• Change to a new UPI if it hasn\'t been updated for a long time\n• After diagnosing, place 2 orders to reactivate withdrawal'
        },
        {
            question: 'What is the minimum withdrawal amount?',
            shortAnswer: 'Minimum withdrawal threshold must remain above 500.',
            fullAnswer: 'The minimum withdrawal threshold must remain above 500.'
        },
        {
            question: 'How long does a withdrawal take?',
            shortAnswer: 'System processes withdrawals every minute for 24 hours.',
            fullAnswer: 'Withdrawal takes time. The system processes withdrawals every minute for 24 hours. If you have completed all the required steps, please keep the tool online and stay active — the system will automatically detect and process it.'
        },
        {
            question: 'What if my withdrawal fails?',
            shortAnswer: 'Check UPI status and follow diagnosis steps.',
            fullAnswer: 'Check if your UPI is working properly and follow the diagnosis steps. If the issue persists, contact customer support.'
        },
        {
            question: 'Can I bind multiple UPI accounts?',
            shortAnswer: 'Yes, we recommend binding multiple active UPI accounts.',
            fullAnswer: 'Yes, our platform allows you to bind multiple UPI accounts. We recommend linking multiple active and valid UPI accounts that can receive transfers properly, to avoid withdrawal failures or delays.'
        }
    ],
    'Account Issues & Security': [
        {
            question: 'I forgot my password. How do I reset it?',
            shortAnswer: 'Use the "Forgot Password" option on the login screen.',
            fullAnswer: 'Use the "Forgot Password" option on the login screen and follow the steps to reset your password via your registered email or phone.'
        },
        {
            question: 'How do I protect my account?',
            shortAnswer: 'Use a strong password and never share your login details.',
            fullAnswer: 'Use a strong password, enable two-factor authentication if available, and never share your login details with anyone. Always verify you\'re on the official app before entering credentials.'
        },
        {
            question: 'Can I change my registered phone number?',
            shortAnswer: 'Contact support to request a phone number change.',
            fullAnswer: 'Please contact our customer support team via Telegram to request a phone number change. You may need to verify your identity.'
        }
    ],
    'Recharge': [
        {
            question: 'How do I recharge my account?',
            shortAnswer: 'Go to Deposit tab and follow the USDT or INR deposit process.',
            fullAnswer: 'Navigate to the Deposit tab from the bottom menu. You can choose to deposit via USDT or purchase quota with INR. Follow the on-screen instructions to complete your recharge.'
        },
        {
            question: 'My recharge is pending. What should I do?',
            shortAnswer: 'Do not cancel. Contact support immediately.',
            fullAnswer: 'If your recharge is pending, please do not cancel the order. Contact APP Customer Service immediately to process the order. You will lose all your money if you cancel your trading order.'
        },
        {
            question: 'What is the minimum recharge amount?',
            shortAnswer: 'Minimum depends on your selected quota package.',
            fullAnswer: 'The minimum recharge amount depends on the quota package you select. Check the Deposit screen for available options and their requirements.'
        }
    ]
};

// FAQ Accordion Item Component
const FAQItem = ({ question, shortAnswer, fullAnswer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-100 last:border-none">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-4 px-4 flex items-start justify-between text-left hover:bg-gray-50 transition-colors"
            >
                <div className="flex-1 pr-4">
                    <h3 className="font-semibold text-gray-800 text-sm">{question}</h3>
                    <p className="text-xs text-gray-500 mt-1">{shortAnswer}</p>
                </div>
                <span className={`material-icons-round text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>
            {isOpen && (
                <div className="px-4 pb-4 text-sm text-gray-600 whitespace-pre-line bg-gray-50 mx-4 mb-4 rounded-lg p-4">
                    {fullAnswer}
                </div>
            )}
        </div>
    );
};

// Support Center View Component
const SupportCenterView = ({ onBack, systemSettings }) => {
    const categories = Object.keys(faqData);
    const [activeCategory, setActiveCategory] = useState(categories[0]);

    return (
        <div className="fixed inset-0 bg-gray-50 z-[60] overflow-y-auto">
            {/* Header */}
            <div className="bg-indigo-800 pt-12 pb-6 px-4">
                <div className="flex items-center">
                    <button onClick={onBack} className="mr-3 p-1 rounded-full hover:bg-white/10 transition-colors">
                        <span className="material-icons-round text-white">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold text-white">Support Center</h1>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="flex overflow-x-auto no-scrollbar px-2 py-3 gap-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${activeCategory === category
                                ? 'bg-indigo-800 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* FAQ List */}
            <div className="px-4 py-4 pb-32">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {faqData[activeCategory]?.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.question}
                            shortAnswer={faq.shortAnswer}
                            fullAnswer={faq.fullAnswer}
                        />
                    ))}
                </div>
            </div>

            {/* Customer Service Section */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 z-[70]">
                <p className="text-xs text-gray-600 font-semibold mb-3">Customer Service</p>
                <div className="flex justify-around">
                    <a
                        href={systemSettings?.telegramSupportLink || 'https://t.me/umoney_support'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center text-center"
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                            <span className="material-icons-round text-blue-600">send</span>
                        </div>
                        <span className="text-xs text-gray-600">Telegram</span>
                    </a>
                    <a
                        href={systemSettings?.telegramSupportLink || 'https://t.me/umoney_support'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center text-center"
                    >
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                            <span className="material-icons-round text-indigo-600">support_agent</span>
                        </div>
                        <span className="text-xs text-gray-600">Contact Support</span>
                    </a>
                    <a
                        href={systemSettings?.telegramGroupLink || 'https://t.me/umoney_group'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center text-center"
                    >
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                            <span className="material-icons-round text-purple-600">groups</span>
                        </div>
                        <span className="text-xs text-gray-600">Join Group</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

const AssetsScreen = () => {
    const { userProfile, currentUser, systemSettings } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentView, setCurrentView] = useState('MAIN');
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Handle URL param for direct navigation to support
    useEffect(() => {
        const viewParam = searchParams.get('view');
        if (viewParam === 'support') {
            setCurrentView('SUPPORT');
            // Clear the URL param after handling
            setSearchParams({});
        }
    }, [searchParams, setSearchParams]);

    // State for Lists
    const [transactions, setTransactions] = useState([]);
    const [listLoading, setListLoading] = useState(false);

    // State for Change Password
    const [passForm, setPassForm] = useState({ new: '', confirm: '' });
    const [passMsg, setPassMsg] = useState('');
    const [passLoading, setPassLoading] = useState(false);

    // State for Profile Recovery
    const [retrying, setRetrying] = useState(false);
    const [fetchError, setFetchError] = useState('');

    // --- Fetch Logic for Histories ---
    const fetchHistory = async (type) => {
        if (!userProfile) return;
        setListLoading(true);
        setFetchError('');
        try {
            const data = await db_getTransactions(userProfile.uid, type);
            setTransactions(data);
        } catch (e) {
            console.error('History fetch error:', e);
            if (e.message?.includes('index')) {
                setFetchError('Database index required. Please check Firebase console.');
            } else {
                setFetchError('Failed to load history. Please try again.');
            }
        }
        setListLoading(false);
    };

    const handleNavigate = (view) => {
        setCurrentView(view);
        setTransactions([]); // Clear old data
        setFetchError('');
        // Pre-fetch data if needed
        if (view === 'QUOTA_HISTORY') fetchHistory('DEPOSIT_INR');
        if (view === 'DEPOSIT_HISTORY') fetchHistory('DEPOSIT_USDT');
        if (view === 'WITHDRAW_HISTORY') fetchHistory('WITHDRAW');
    };

    // --- Render Components ---

    const renderHeader = (title) => (
        <div className="flex items-center mb-6 px-4 pt-12">
            <button onClick={() => setCurrentView('MAIN')} className="mr-3 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <span className="material-icons-round text-gray-700">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        </div>
    );

    const renderTransactionList = (items, emptyMsg) => (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mx-4">
            {listLoading ? (
                <div className="p-8 flex justify-center">
                    <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                </div>
            ) : fetchError ? (
                <div className="p-8 text-center flex flex-col items-center text-red-400">
                    <span className="material-icons-outlined text-4xl mb-2">error</span>
                    <p className="text-sm text-red-500">{fetchError}</p>
                </div>
            ) : items.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center text-gray-400">
                    <span className="material-icons-outlined text-4xl mb-2 opacity-30">history</span>
                    <p className="text-sm">{emptyMsg}</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                    {items.map(tx => (
                        <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'WITHDRAW' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                                    <span className="material-icons-round text-sm">
                                        {tx.type === 'WITHDRAW' ? 'arrow_upward' : 'arrow_downward'}
                                    </span>
                                </div>
                                <div>
                                    <div className="font-semibold text-sm text-gray-800">
                                        {tx.description || (tx.type === 'DEPOSIT_INR' ? 'Quota Purchase' : tx.type === 'DEPOSIT_USDT' ? 'USDT Deposit' : 'Withdrawal')}
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">
                                        {tx.date && tx.date.seconds
                                            ? new Date(tx.date.seconds * 1000).toLocaleString()
                                            : 'Just now'}
                                    </div>
                                    {tx.utr && <div className="text-[10px] text-gray-500 mt-0.5 font-mono">Ref: {tx.utr}</div>}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`font-bold text-sm ${tx.type === 'WITHDRAW' ? 'text-red-600' : 'text-green-600'}`}>
                                    {tx.type === 'WITHDRAW' ? '-' : '+'}{tx.amountInr ? `₹${tx.amountInr}` : `${tx.amount} ${tx.type.includes('USDT') ? 'USDT' : 'INR'}`}
                                </div>
                                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 uppercase tracking-wide
                                  ${tx.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                        tx.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                            'bg-orange-100 text-orange-700'}`}>
                                    {tx.status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderChangePassword = () => {
        const handleSubmit = async () => {
            if (passForm.new.length < 6) { setPassMsg('Password must be at least 6 characters'); return; }
            if (passForm.new !== passForm.confirm) { setPassMsg('Passwords do not match'); return; }
            setPassLoading(true);
            try {
                await auth_updateUserPassword(passForm.new);
                setPassMsg('Password updated successfully!');
                setPassForm({ new: '', confirm: '' });
            } catch (e) {
                setPassMsg(e.message || 'Error updating password. Please re-login and try again.');
            }
            setPassLoading(false);
        };

        return (
            <div className="px-4">
                <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block">New Password</label>
                        <input
                            type="password"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={passForm.new}
                            onChange={e => setPassForm({ ...passForm, new: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block">Confirm Password</label>
                        <input
                            type="password"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={passForm.confirm}
                            onChange={e => setPassForm({ ...passForm, confirm: e.target.value })}
                        />
                    </div>
                    {passMsg && (
                        <div className={`text-xs text-center p-2 rounded ${passMsg.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                            {passMsg}
                        </div>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={passLoading}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
                    >
                        {passLoading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </div>
        );
    };

    // --- Sub-View Switcher ---
    if (currentView !== 'MAIN') {
        return (
            <div className="bg-[#f3f4f6] min-h-screen pb-24 font-sans">
                {currentView === 'QUOTA_HISTORY' && (
                    <> {renderHeader('Quota History')} {renderTransactionList(transactions, 'No quota purchases found.')} </>
                )}
                {currentView === 'DEPOSIT_HISTORY' && (
                    <> {renderHeader('Deposit History')} {renderTransactionList(transactions, 'No USDT deposits found.')} </>
                )}
                {currentView === 'WITHDRAW_HISTORY' && (
                    <> {renderHeader('Withdrawal History')} {renderTransactionList(transactions, 'No withdrawals found.')} </>
                )}
                {currentView === 'SUPPORT' && (
                    <SupportCenterView
                        onBack={() => setCurrentView('MAIN')}
                        systemSettings={systemSettings}
                    />
                )}
                {currentView === 'CHANGE_PASSWORD' && (
                    <> {renderHeader('Change Password')} {renderChangePassword()} </>
                )}
                {currentView === 'VERSION' && (
                    <>
                        {renderHeader('Version Update')}
                        <div className="px-4 text-center mt-12">
                            <div className="w-24 h-24 bg-white rounded-2xl shadow-sm mx-auto flex items-center justify-center mb-6">
                                <span className="material-icons-round text-5xl text-blue-600">system_update</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-1">UMoney App</h2>
                            <p className="text-sm text-gray-500 mb-8">Current Version 1.0.0 (Beta)</p>

                            <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm font-medium mb-8 mx-auto max-w-xs">
                                You are using the latest version.
                            </div>

                            <button className="px-8 py-3 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold shadow-sm hover:bg-gray-50">
                                Check for Updates
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // --- Profile Recovery UI ---
    const handleRetryProfile = async () => {
        if (!currentUser) return;
        setRetrying(true);
        try {
            await db_ensureProfile(currentUser.uid, currentUser.email || '');
            window.location.reload(); // Reload to trigger context refresh
        } catch (e) {
            console.error("Failed to create profile", e);
            let errorMsg = "Failed to recover profile.";
            if (e.code === 'permission-denied' || e.message?.includes('permission')) {
                errorMsg = "Permission denied. Please check Firestore security rules. See FIRESTORE_SETUP.md for instructions.";
            } else if (e.message) {
                errorMsg = `Error: ${e.message}`;
            }
            alert(errorMsg);
        } finally {
            setRetrying(false);
        }
    };

    if (!userProfile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-[#f3f4f6]">
                <span className="material-icons-round text-6xl text-gray-300 mb-4">account_circle</span>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Profile Not Found</h3>
                <p className="text-gray-500 mb-8 max-w-sm">
                    We couldn't load your user profile. Click the button below to create your profile and access all features.
                </p>
                <button
                    onClick={handleRetryProfile}
                    disabled={retrying}
                    className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {retrying ? 'Creating Profile...' : 'Create Profile Now'}
                </button>
            </div>
        );
    }

    // --- Main Assets View ---
    const menuItems = [
        { icon: 'description', label: 'Quota History', bg: 'bg-purple-50', text: 'text-purple-600', action: () => handleNavigate('QUOTA_HISTORY') },
        { icon: 'move_to_inbox', label: 'Deposit History', bg: 'bg-green-50', text: 'text-green-600', action: () => handleNavigate('DEPOSIT_HISTORY') },
        { icon: 'upload', label: 'Withdrawal History', bg: 'bg-red-50', text: 'text-red-600', action: () => handleNavigate('WITHDRAW_HISTORY') },
        { icon: 'help_outline', label: 'Support Center', bg: 'bg-orange-50', text: 'text-orange-600', action: () => handleNavigate('SUPPORT') },
        // Removed Payment Pin as requested
        { icon: 'lock', label: 'Change Password', bg: 'bg-blue-50', text: 'text-blue-600', action: () => handleNavigate('CHANGE_PASSWORD') },
        { icon: 'system_update', label: 'Version Update', bg: 'bg-sky-50', text: 'text-sky-600', action: () => handleNavigate('VERSION') },
        { icon: 'logout', label: 'Logout', bg: 'bg-rose-50', text: 'text-rose-600', action: () => setShowLogoutModal(true) },
    ];

    return (
        <div className="bg-[#f3f4f6] min-h-screen pb-24 font-sans">
            {/* Header Section */}
            <div className="bg-assets-primary pt-12 pb-6 px-5 rounded-b-[2rem] shadow-lg relative z-10">
                <div className="text-center mb-6">
                    <h1 className="text-white text-lg font-medium tracking-wide">Assets</h1>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-full bg-yellow-100 border-2 border-yellow-300 overflow-hidden flex items-center justify-center">
                                <img alt="User Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGYEaYgs7vLQ6u5zH4n8cX8fcDukR-VLVoTKr3Xav3OQtz5VyrIDTXfEK-MsG3uH7w3h1LX9DfED9pufWvMx5FL4tiZXnkww0YCfccgG__iAZWZakbUkKiV4ZPjVdYDYsSMo5Sp-0vEk6pLcdweXg1rZKHuslNWRJI1Gg8YdYly2zFMWYbX9f6DTzXCYJnFqz0bdvwpL7VXBkR_-IWeFnx4K4YC0zKVUg_82rfo-OkYRtdOWMvISjWeGPjIeea2pt1Ky0CzN7wbl2R" />
                            </div>
                        </div>
                        <div className="text-white">
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="text-lg font-semibold tracking-wide">
                                    {userProfile?.phone || userProfile?.email?.split('@')[0] || 'User'}
                                </span>
                                <button className="opacity-80 hover:opacity-100 transition-opacity">
                                    <span className="material-icons-round text-sm">content_copy</span>
                                </button>
                            </div>
                            <div className="flex items-center space-x-2 text-sm opacity-90">
                                <span>ID: {userProfile?.referralCode}</span>
                                <button className="opacity-80 hover:opacity-100 transition-opacity">
                                    <span className="material-icons-round text-xs">content_copy</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white px-3 py-1 rounded-full shadow-sm">
                        <span className="text-assets-primary text-xs font-bold">Reward Ratio: 3</span>
                    </div>
                </div>
            </div>

            {/* Stats and Links Section */}
            <div className="px-4 -mt-4 relative z-20 space-y-4">
                {/* Stats Card */}
                <div className="bg-assets-primary text-white rounded-2xl shadow-lg p-6 flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-baseline space-x-1">
                            <span className="text-xl font-medium">₹</span>
                            <span className="text-2xl font-bold">{userProfile?.inrBalance.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="text-sm opacity-80 mt-1 font-light">Quota</div>
                    </div>
                    <div className="w-px h-10 bg-white/20 mx-4"></div>
                    <div className="flex-1 pl-4">
                        <div className="text-2xl font-bold">0.00</div>
                        <div className="text-sm opacity-80 mt-1 font-light">Today's Earning</div>
                    </div>
                </div>

                {/* Menu Links */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={(e) => { e.preventDefault(); item.action(); }}
                            className="flex w-full items-center justify-between p-4 border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.text}`}>
                                    <span className="material-icons-round text-xl">{item.icon}</span>
                                </div>
                                <span className="text-gray-700 font-semibold text-sm">{item.label}</span>
                            </div>
                            <span className="material-icons-round text-gray-300 text-xl">chevron_right</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl slide-up text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-icons-round text-3xl text-red-600">logout</span>
                        </div>
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Sign Out?</h2>
                        <p className="text-sm text-gray-500 mb-6">Are you sure you want to log out of your account?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => auth_signOut()}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors shadow-lg"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetsScreen;