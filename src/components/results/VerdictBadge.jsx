import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  Info
} from 'lucide-react';
import { cn } from '../ui/Button';

const verdictConfigs = {
  SAFE: {
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
    glow: 'shadow-[0_0_20px_rgba(0,255,136,0.2)]',
    icon: ShieldCheck,
    label: 'SAFE'
  },
  LOW_RISK: {
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    glow: 'shadow-[0_0_20px_rgba(0,212,255,0.2)]',
    icon: Info,
    label: 'LOW RISK'
  },
  MEDIUM_RISK: {
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    glow: 'shadow-[0_0_20px_rgba(255,170,0,0.2)]',
    icon: AlertTriangle,
    label: 'MEDIUM RISK'
  },
  HIGH_RISK: {
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    glow: 'shadow-[0_0_20px_rgba(249,115,22,0.2)]',
    icon: ShieldAlert,
    label: 'HIGH RISK'
  },
  SUSPICIOUS: {
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    glow: 'shadow-[0_0_20px_rgba(255,170,0,0.2)]',
    icon: AlertTriangle,
    label: 'SUSPICIOUS'
  },
  CRITICAL: {
    color: 'text-danger',
    bg: 'bg-danger/10',
    border: 'border-danger/20',
    glow: 'shadow-[0_0_20px_rgba(255,68,85,0.2)]',
    icon: ShieldX,
    label: 'CRITICAL'
  }
};

const VerdictBadge = ({ verdict = 'SAFE', className }) => {
  const config = verdictConfigs[verdict] || verdictConfigs.SAFE;
  const Icon = config.icon;

  return (
    <div className={cn(
      "inline-flex items-center gap-3 px-6 py-3 rounded-2xl border font-black tracking-widest uppercase transition-all duration-500",
      config.bg, config.color, config.border, config.glow,
      className
    )}>
      <Icon className="w-6 h-6" />
      <span className="text-xl">{config.label}</span>
    </div>
  );
};

export default VerdictBadge;
