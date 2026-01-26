import React from 'react';
import FirebaseSetupGuide from './FirebaseSetupGuide.jsx';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.state = { hasError: true, error, errorInfo };
    }

    render() {
        if (this.state.hasError) {
            // Check if it's a Firebase configuration error
            const errorMessage = this.state.error?.toString() || '';
            const isFirebaseError = errorMessage.includes('Firebase') ||
                errorMessage.includes('auth') ||
                errorMessage.includes('firestore') ||
                errorMessage.includes('apiKey') ||
                !import.meta.env.VITE_FIREBASE_API_KEY ||
                import.meta.env.VITE_FIREBASE_API_KEY === 'your-api-key-here';

            if (isFirebaseError) {
                return <FirebaseSetupGuide />;
            }

            // For other errors, show generic error page
            return (
                <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
                        <div className="flex items-center mb-4">
                            <span className="material-icons-round text-5xl text-red-500 mr-4">error</span>
                            <h1 className="text-2xl font-bold text-gray-800">Application Error</h1>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                            <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
                            <pre className="text-sm text-red-700 overflow-auto whitespace-pre-wrap">
                                {this.state.error && this.state.error.toString()}
                            </pre>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
