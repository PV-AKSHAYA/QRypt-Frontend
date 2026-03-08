import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Globe, Shield, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '../ui/Button';

/**
 * Technical layer card — accepts data.technical_layer from the backend:
 * {
 *   original_url, final_url, redirect_chain, hop_count,
 *   ssl_valid, is_shortener, domain_entropy, tld_risk_score,
 *   suspicious_keywords,
 *   virustotal: { malicious, suspicious, harmless, total_engines, reputation_class }
 * }
 */
const TechnicalCard = ({ data }) => {
  if (!data) return null;

  const vt = data.virustotal || {};

  // tld_risk_score from backend is 0-1 float; normalise to %
  const tldRiskPct = data.tld_risk_score
    ? (data.tld_risk_score <= 1 ? Math.round(data.tld_risk_score * 100) : Math.round(data.tld_risk_score))
    : 0;

  const isMalicious = (vt.malicious || 0) > 0;
  const keywords = data.suspicious_keywords || [];

  return (
    <Card title="URL Intelligence" icon={Globe}>
      <div className="space-y-6">
        {/* URLs */}
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">Original URL</span>
            <p className="text-sm font-mono break-all text-text-primary p-2 bg-white/5 rounded-lg border border-white/5">
              {data.original_url}
            </p>
          </div>

          {data.final_url && data.final_url !== data.original_url && (
            <>
              <div className="flex justify-center -my-2">
                <ArrowRight className="w-4 h-4 text-text-secondary rotate-90" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">
                  Final Destination
                  {(data.hop_count || 0) > 0 && (
                    <span className="ml-2 text-warning">({data.hop_count} redirect{data.hop_count > 1 ? 's' : ''})</span>
                  )}
                </span>
                <p className="text-sm font-mono break-all text-primary p-2 bg-primary/5 rounded-lg border border-primary/10">
                  {data.final_url}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {data.is_shortener && <Badge variant="medium">Shortener Detected</Badge>}
          <Badge variant={data.ssl_valid ? 'safe' : 'critical'}>
            {data.ssl_valid ? 'Valid SSL' : 'Invalid SSL'}
          </Badge>
          {data.hop_count > 0 && (
            <Badge variant="low" dot={false}>{data.hop_count} Hops</Badge>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-white/5">
            <span className="text-[10px] uppercase font-bold text-text-secondary block mb-1">TLD Risk</span>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-orange-500"
                style={{ width: `${tldRiskPct}%` }}
              />
            </div>
            <span className="text-xs font-bold block text-right mt-1">{tldRiskPct}%</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <span className="text-[10px] uppercase font-bold text-text-secondary block mb-1">Domain Entropy</span>
            <div className="flex items-end gap-1 mt-2">
              <span className="text-lg font-bold leading-none">{(data.domain_entropy || 0).toFixed(2)}</span>
              <span className="text-[10px] text-text-secondary pb-0.5">/ 8.0</span>
            </div>
          </div>
        </div>

        {/* VirusTotal */}
        <div className={cn(
          "p-4 rounded-xl border",
          isMalicious ? "bg-danger/5 border-danger/20" : "bg-success/5 border-success/20"
        )}>
          <div className="flex items-center gap-3 mb-3">
            <Shield className={cn("w-5 h-5", isMalicious ? "text-danger" : "text-success")} />
            <span className="text-sm font-bold uppercase tracking-wider">VirusTotal</span>
            <span className={cn(
              "ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded",
              isMalicious ? "bg-danger/20 text-danger" : "bg-success/20 text-success"
            )}>
              {vt.reputation_class || 'CLEAN'}
            </span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-secondary">Scanning Engines</span>
            <span className="text-xs font-bold">
              {vt.malicious || 0} malicious / {vt.total_engines || 0} engines
            </span>
          </div>

          {/* Bar */}
          {(vt.total_engines || 0) > 0 && (
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full", isMalicious ? "bg-danger" : "bg-success")}
                style={{ width: `${Math.min(100, ((vt.malicious || 0) / (vt.total_engines || 1)) * 100)}%` }}
              />
            </div>
          )}

          {isMalicious && (
            <div className="flex items-center gap-2 px-3 py-2 bg-danger/20 rounded-lg text-danger mt-3">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase">
                {vt.malicious} engine{vt.malicious > 1 ? 's' : ''} flagged this URL as malicious
              </span>
            </div>
          )}
        </div>

        {/* Suspicious Keywords */}
        {keywords.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-text-secondary">Suspicious Patterns</span>
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((kw, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-danger/10 text-danger text-[10px] font-mono border border-danger/10">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TechnicalCard;
