import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Target, Users } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Setting up your workspace..." 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    { icon: Users, text: "Loading team data", delay: 800 },
    { icon: Target, text: "Syncing projects", delay: 1200 },
    { icon: Clock, text: "Preparing timeline", delay: 1600 },
    { icon: CheckCircle, text: "Almost ready", delay: 2000 }
  ];

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Step progression
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center z-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto px-8">
        {/* Main Logo/Icon Area */}
        <div className="mb-8 relative">
          <div className="w-20 h-20 mx-auto relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 border-4 border-transparent bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin"
                 style={{ 
                   background: 'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #3b82f6)',
                   mask: 'radial-gradient(circle at center, transparent 60%, black 61%)',
                   WebkitMask: 'radial-gradient(circle at center, transparent 60%, black 61%)'
                 }}>
            </div>
            
            {/* Inner pulsing circle */}
            <div className="absolute inset-3 bg-white rounded-full shadow-lg flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center animate-pulse">
                <Target className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500 font-medium">
            {Math.round(Math.min(progress, 100))}% Complete
          </div>
        </div>

        {/* Loading Steps */}
        <div className="space-y-4 mb-8">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div 
                key={index}
                className={`flex items-center space-x-3 transition-all duration-500 ${
                  isActive ? 'opacity-100 transform translate-x-0' : 
                  isCompleted ? 'opacity-60' : 'opacity-30'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted ? 'bg-green-100 text-green-600' :
                  isActive ? 'bg-blue-100 text-blue-600 animate-pulse' : 
                  'bg-gray-100 text-gray-400'
                }`}>
                  {isCompleted ? 
                    <CheckCircle className="w-4 h-4" /> : 
                    <StepIcon className="w-4 h-4" />
                  }
                </div>
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  isActive ? 'text-gray-900' : 
                  isCompleted ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.text}
                </span>
                {isActive && (
                  <div className="flex space-x-1 ml-auto">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Main Message */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 animate-pulse">
            {message}
          </h2>
          <p className="text-sm text-gray-500">
            This won't take long. We're preparing everything for you.
          </p>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-75"></div>
      <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-ping opacity-50" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-pink-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '2s' }}></div>
    </div>
  );
};

export default LoadingScreen;
