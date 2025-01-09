import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../firebase-config.ts'

const LoginPage = () => {
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('User signed in:', user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden p-4">
      {/* Decorative Circles - Made responsive */}
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] md:w-[150%] h-[200%] md:h-[150%]"
          viewBox="0 0 800 800"
          fill="none"
        >
          <circle cx="400" cy="400" r="260" stroke="#F3E8FF" strokeWidth="1" fill="none" />
          <circle cx="400" cy="400" r="220" stroke="#F3E8FF" strokeWidth="1.5" fill="none" />
          <circle cx="400" cy="400" r="180" stroke="#F3E8FF" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="w-full max-w-md mx-auto px-4 sm:px-8 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-8">
          {/* Logo and Title - Adjusted for mobile */}
          <div className="flex flex-col items-center space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              <svg
                className="w-8 h-8 sm:w-12 sm:h-12 text-purple-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">TaskBuddy</h1>
            </div>
            <p className="text-gray-600 text-center text-base sm:text-lg max-w-sm px-4">
              Streamline your workflow and track progress effortlessly
            </p>
          </div>

          {/* Google Sign-In Button - Made responsive */}
          <div className="w-full max-w-sm">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center space-x-3 sm:space-x-4 bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 sm:py-4 px-4 sm:px-6 border border-gray-300 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-base sm:text-lg">Continue with Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;