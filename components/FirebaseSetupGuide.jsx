import React from 'react';

const FirebaseSetupGuide = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                    <div className="flex items-center mb-4">
                        <span className="material-icons-round text-5xl mr-4">settings</span>
                        <div>
                            <h1 className="text-3xl font-bold">Firebase Setup Required</h1>
                            <p className="text-blue-100 mt-1">Configure your Firebase project to get started</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="mb-8">
                        <div className="flex items-center mb-4">
                            <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">1</span>
                            <h2 className="text-xl font-semibold text-gray-800">Create Firebase Project</h2>
                        </div>
                        <div className="ml-11 space-y-2 text-gray-600">
                            <p>• Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Firebase Console</a></p>
                            <p>• Click "Add project" and follow the setup wizard</p>
                            <p>• Give your project a name (e.g., "UMoney")</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-center mb-4">
                            <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">2</span>
                            <h2 className="text-xl font-semibold text-gray-800">Enable Required Services</h2>
                        </div>
                        <div className="ml-11 space-y-3">
                            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                                <p className="font-semibold text-amber-800 mb-2">🔐 Authentication</p>
                                <p className="text-sm text-amber-700">Go to Authentication → Sign-in method → Enable "Email/Password"</p>
                            </div>
                            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                                <p className="font-semibold text-green-800 mb-2">📊 Firestore Database</p>
                                <p className="text-sm text-green-700">Go to Firestore Database → Create database → Start in production mode</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-center mb-4">
                            <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">3</span>
                            <h2 className="text-xl font-semibold text-gray-800">Get Configuration</h2>
                        </div>
                        <div className="ml-11 space-y-2 text-gray-600">
                            <p>• Go to Project Settings (⚙️ icon) → General</p>
                            <p>• Scroll to "Your apps" section</p>
                            <p>• Click the Web icon (&lt;/&gt;) to add a web app</p>
                            <p>• Copy the firebaseConfig object</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-center mb-4">
                            <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">4</span>
                            <h2 className="text-xl font-semibold text-gray-800">Update .env File</h2>
                        </div>
                        <div className="ml-11">
                            <p className="text-gray-600 mb-3">Open the <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">.env</code> file in your project root and update with your values:</p>
                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                                <div className="text-gray-400"># Replace these with your actual Firebase config</div>
                                <div className="text-green-400">VITE_FIREBASE_API_KEY=</div>
                                <div className="text-green-400">VITE_FIREBASE_AUTH_DOMAIN=</div>
                                <div className="text-green-400">VITE_FIREBASE_PROJECT_ID=</div>
                                <div className="text-green-400">VITE_FIREBASE_STORAGE_BUCKET=</div>
                                <div className="text-green-400">VITE_FIREBASE_MESSAGING_SENDER_ID=</div>
                                <div className="text-green-400">VITE_FIREBASE_APP_ID=</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-start">
                            <span className="material-icons-round text-blue-600 mr-3">info</span>
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-2">After Configuration</h3>
                                <p className="text-blue-800 text-sm">
                                    Save the .env file and the development server will automatically reload.
                                    The white screen will be replaced with the login page.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Need help? Check the <code className="bg-gray-200 px-2 py-1 rounded text-xs">README.md</code> file
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            <span className="material-icons-round text-sm">refresh</span>
                            Reload Page
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FirebaseSetupGuide;
