import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../ui/Button';

/**
 * A simple animated bar showing a 0-100 risk score.
 * Usage: <BreakdownBar title="Physical Analysis" score={42} colorClass="bg-purple-500" />
 */
const BreakdownBar = ({ title, score = 0, colorClass = 'bg-primary' }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-text-secondary">
        <span>{title}</span>
        <span>{score} / 100</span>
      </div>
      <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div
          className={cn("h-full rounded-full", colorClass)}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, score)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default BreakdownBar;
