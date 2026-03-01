import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface TimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  showWarning?: boolean;
}

const Timer: React.FC<TimerProps> = ({ duration, onTimeUp, showWarning = true }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        
        // Show warning when 5 minutes left
        if (prev <= 300 && showWarning && !isWarning) {
          setIsWarning(true);
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onTimeUp, showWarning, isWarning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((duration - timeLeft) / duration) * 100;
  };

  return (
    <div className={`flex items-center space-x-3 ${isWarning ? 'text-red-600' : 'text-gray-700'}`}>
      {isWarning && <AlertTriangle className="w-5 h-5 animate-pulse" />}
      <Clock className="w-5 h-5" />
      <div className="text-right">
        <div className={`text-lg font-bold ${isWarning ? 'text-red-600' : 'text-gray-800'}`}>
          {formatTime(timeLeft)}
        </div>
        <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              isWarning ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Timer;