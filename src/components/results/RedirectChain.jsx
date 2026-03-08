import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../ui/Button';

/**
 * Redirect chain visualiser.
 *
 * Accepts either:
 *  - Array of strings:  ["https://bit.ly/...", "https://final.com"]  (new backend format)
 *  - Array of objects:  [{ url, status_code, is_shortener }]          (legacy mock format)
 */
const RedirectChain = ({ chain }) => {
  if (!chain || chain.length === 0) return (
    <div className="p-6 text-center text-text-secondary text-sm italic">
      No redirects — URL resolves directly.
    </div>
  );

  // Normalise both formats to a consistent object shape
  const hops = chain.map((item, index) => {
    if (typeof item === 'string') {
      return { hop: index, url: item, status_code: null, is_shortener: false };
    }
    return { hop: item.hop ?? index, url: item.url, status_code: item.status_code ?? null, is_shortener: !!item.is_shortener };
  });

  return (
    <div className="p-6 space-y-8">
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-white/10" />

        <div className="space-y-6 relative">
          {hops.map((hop, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
              className="flex items-start gap-6"
            >
              {/* Point */}
              <div className={cn(
                "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0",
                index === hops.length - 1
                  ? "bg-primary border-primary text-black"
                  : "bg-card border-white/20 text-text-secondary"
              )}>
                <span className="text-[10px] font-bold">{index}</span>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2 pt-1.5 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  {hop.status_code && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold",
                      hop.status_code < 300
                        ? "bg-success/20 text-success border border-success/20"
                        : "bg-warning/20 text-warning border border-warning/20"
                    )}>
                      HTTP {hop.status_code}
                    </span>
                  )}
                  {index === 0 && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-text-secondary border border-white/10">
                      ORIGIN
                    </span>
                  )}
                  {index === hops.length - 1 && index > 0 && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/20 text-primary border border-primary/20">
                      FINAL
                    </span>
                  )}
                  {hop.is_shortener && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/20">
                      SHORTENER
                    </span>
                  )}
                </div>
                <p className="text-sm font-mono break-all text-text-primary pr-4">
                  {hop.url}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RedirectChain;
