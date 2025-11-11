'use client';

export default function Loading({ type = 'default', message = 'Loading...', count = 76 }) {
  const getLoadingContent = () => {
    switch (type) {
      case 'compare':
        return {
          title: `Searching ${count} Service Providers`,
          subtitle: 'Finding the best parking deals for you...',
          icon: '🚗',
          color: 'from-blue-500 to-purple-600'
        };
      case 'checkout':
        return {
          title: 'Processing Your Booking',
          subtitle: 'Securing your parking space...',
          icon: '🔒',
          color: 'from-green-500 to-blue-600'
        };
      default:
        return {
          title: message,
          subtitle: 'Please wait while we process your request...',
          icon: '⏳',
          color: 'from-orange-500 to-red-600'
        };
    }
  };

  const content = getLoadingContent();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-6xl mb-4 animate-bounce">
              {content.icon}
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-pulse">
            {content.title}
          </h2>
          <p className="text-gray-600 animate-pulse">
            {content.subtitle}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${content.color} rounded-full animate-progress`}
              style={{
                animation: 'progress 2s ease-in-out infinite'
              }}
            ></div>
          </div>
        </div>

        {/* loading icon */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((dot) => (
            <div
              key={dot}
              className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-bounce"
              style={{
                animationDelay: `${dot * 0.2}s`,
                animationDuration: '1s'
              }}
            ></div>
          ))}
        </div>

        {/* Results Count */}
        {type === 'compare' && (
          <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200 animate-fade-in">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">
                Scanning availability across all providers...
              </span>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes progress {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-progress {
            animation: progress 2s ease-in-out infinite;
          }
          
          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}