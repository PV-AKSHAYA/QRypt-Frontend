import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Fingerprint } from 'lucide-react';
import { cn } from '../ui/Button';

/**
 * Physical layer card — accepts data.physical_layer from the backend:
 * { tampered: bool, confidence: float (0-1), evidence: string }
 */
const PhysicalCard = ({ data }) => {
  if (!data) return null;

  // confidence comes as 0-1 float or 0-100 int — normalise to %
  const confidencePct = data.confidence <= 1
    ? Math.round(data.confidence * 100)
    : Math.round(data.confidence);

  return (
    <Card
      title="Physical Layer"
      icon={Fingerprint}
      expandable
      actions={
        <Badge variant={data.tampered ? 'critical' : 'safe'}>
          {data.tampered ? 'Tampered' : 'Intact'}
        </Badge>
      }
    >
      <div className="space-y-6">
        {/* Confidence */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Analysis Confidence</span>
            <span className="text-sm font-bold text-primary">{confidencePct}%</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                data.tampered ? "bg-danger" : "bg-success"
              )}
              style={{ width: `${confidencePct}%` }}
            />
          </div>
        </div>

        {/* Evidence */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 italic text-sm text-text-secondary">
          "{data.evidence}"
        </div>

        {/* Tamper status indicator */}
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-xl border",
          data.tampered
            ? "bg-danger/5 border-danger/20 text-danger"
            : "bg-success/5 border-success/20 text-success"
        )}>
          <div className={cn(
            "w-2.5 h-2.5 rounded-full",
            data.tampered ? "bg-danger" : "bg-success"
          )} />
          <span className="text-sm font-bold uppercase tracking-wide">
            {data.tampered ? "Physical tampering detected" : "No tampering detected"}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default PhysicalCard;
