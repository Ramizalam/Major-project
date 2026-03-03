import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  initialSeconds: number;
  onTimeUp: () => void;
}

const Timer: React.FC<TimerProps> = ({ initialSeconds, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    // Stop and trigger submission when time hits 0
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    // Tick down every second
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(timerId);
  }, [timeLeft, onTimeUp]);

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Turn red when less than 5 minutes remain
  const isUrgent = timeLeft < 300;

  return (
    <div className={`flex items-center gap-2 px-5 py-2 rounded-xl font-mono text-xl font-bold border shadow-inner ${
      isUrgent 
        ? 'bg-red-100 text-red-600 border-red-300 animate-pulse' 
        : 'bg-slate-800/30 text-white border-white/20'
    }`}>
      <Clock size={22} className={isUrgent ? 'text-red-500' : 'text-cyan-400'} />
      {formatTime(timeLeft)}
    </div>
  );
};

export default Timer;