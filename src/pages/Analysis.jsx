import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Share2,
  Calendar,
  Eye,
  LayoutGrid,
  Bell,
  BrainCircuit,
} from 'lucide-react';
import { SCAN_RESULT_KEY } from '../services/api';
import RiskScoreCircle from '../components/results/RiskScoreCircle';
import VerdictBadge from '../components/results/VerdictBadge';
import PhysicalCard from '../components/results/PhysicalCard';
import TechnicalCard from '../components/results/TechnicalCard';
import AIContextCard from '../components/results/AIContextCard';
import RedirectChain from '../components/results/RedirectChain';
import BreakdownBar from '../components/results/BreakdownBar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { cn } from '../components/ui/Button';

// ── Verdict helpers ────────────────────────────────────────────────────────
const getVerdictAction = (verdict) => {
  switch (verdict) {
    case 'SAFE':
      return {
        title: 'Safe to Proceed',
        message:
          'Our multi-layer forensic analysis shows no signs of malicious activity or physical tampering. This QR code appears authentic and safe to use.',
        className: 'bg-success/10 border-success/30 text-success',
        icon: CheckCircle2,
      };
    case 'HIGH_RISK':
    case 'CRITICAL':
      return {
        title: 'Proceed with Extreme Caution',
        message:
          'Forensics detected patterns highly consistent with phishing or malware delivery. The URL destination does not match the visual branding, and physical integrity checks failed.',
        className: 'bg-danger/10 border-danger/30 text-danger',
        icon: ShieldAlert,
      };
    default:
      return {
        title: 'Proceed with Caution',
        message:
          'Some anomalies were detected during analysis. While not definitively malicious, the source or destination shows signs of risk. Verify the source carefully.',
        className: 'bg-warning/10 border-warning/30 text-warning',
        icon: AlertTriangle,
      };
  }
};

// ── Component ──────────────────────────────────────────────────────────────
const Analysis = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SCAN_RESULT_KEY);
      if (raw) {
        setData(JSON.parse(raw));
        return;
      }
    } catch (_) {
      // corrupted data — clear it
      sessionStorage.removeItem(SCAN_RESULT_KEY);
    }
    // No real result — redirect back to scanner
    navigate('/scan');
  }, [navigate]);

  if (!data) return null;

  const physical = data.physical_layer;
  const technical = data.technical_layer;
  const ai = data.ai_layer;
  const risk = data.risk;
  const threat = data.threat_memory;
  const qr = data.qr;

  const action = getVerdictAction(risk?.verdict);
  const ActionIcon = action.icon;

  // Normalise breakdown scores (backend gives 0-100 already)
  const breakdown = risk?.breakdown || {};
  const physScore = breakdown.physical_score ?? 0;
  const threatScore = breakdown.threat_intel_score ?? 0;
  const aiScore = breakdown.ai_context_score ?? 0;

  const isAIUnavailable = !ai?.confidence || ai.confidence === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 pb-20"
    >
      {/* ── Threat Memory Banner ───────────────────────────────────────── */}
      {threat?.seen_before && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-4 p-5 rounded-2xl bg-warning/10 border border-warning/30 text-warning"
        >
          <Bell className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-sm">Previously Seen Threat</p>
            <p className="text-xs opacity-80 mt-0.5">
              This URL has been scanned <strong>{threat.previous_scan_count}</strong> time{threat.previous_scan_count !== 1 ? 's' : ''} before.
              Last verdict: <span className="font-mono font-bold">{threat.last_verdict || '—'}</span>
              {threat.first_seen && ` · First seen ${new Date(threat.first_seen).toLocaleDateString()}`}
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-text-secondary text-xs font-bold uppercase tracking-[0.2em]">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(data.timestamp).toLocaleDateString()} at {new Date(data.timestamp).toLocaleTimeString()}
          </div>
          <h1 className="text-3xl font-black flex items-center gap-4">
            Analysis Report
            <span className="text-text-secondary font-mono text-sm tracking-tighter bg-white/5 px-2 py-1 rounded">
              ID: {data.scan_id}
            </span>
          </h1>
          {qr?.raw_content && (
            <p className="text-text-secondary text-sm font-mono truncate max-w-xl">
              {qr.raw_content}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={() => navigate('/scan')}
          >
            Scan Another
          </Button>
        </div>
      </div>

      {/* ── Hero: Risk Score ────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center space-y-8 py-10 glass rounded-[40px] border-white/5 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
        <RiskScoreCircle score={risk?.score ?? 0} />
        <div className="text-center space-y-4">
          <VerdictBadge verdict={risk?.verdict} />
          <p className="text-text-secondary max-w-md mx-auto italic text-sm">
            Based on physical, technical, and visual analysis layers.
          </p>
        </div>
      </section>

      {/* ── Three Layer Cards ────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <PhysicalCard data={physical} />
        <TechnicalCard data={technical} />
        <AIContextCard data={ai} />
      </section>

      {/* ── Expandable Details ───────────────────────────────────────────── */}
      <section className="space-y-6">
        {/* Redirect Chain */}
        <Card title="Full Redirect Chain" icon={Share2} expandable>
          <RedirectChain chain={technical?.redirect_chain} />
        </Card>

        {/* Risk Breakdown */}
        <Card title="Risk Score Breakdown" icon={LayoutGrid} expandable defaultExpanded>
          <div className="space-y-8 p-4">
            <BreakdownBar
              title="Physical Analysis"
              score={physScore}
              colorClass="bg-purple-500"
            />
            <BreakdownBar
              title="Threat Intelligence"
              score={threatScore}
              colorClass="bg-primary"
            />
            <BreakdownBar
              title="AI Forensic Context"
              score={aiScore}
              colorClass="bg-success"
            />

            <div className="pt-4 border-t border-white/10 flex justify-between items-center font-bold">
              <span className="text-text-secondary uppercase text-xs">Total Aggregate Risk</span>
              <span className="text-2xl text-primary">{risk?.score ?? 0} / 100</span>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Final Action Box ─────────────────────────────────────────────── */}
      <section className={cn(
        "p-8 rounded-[32px] border flex flex-col md:flex-row items-center gap-8",
        action.className
      )}>
        <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center shrink-0">
          <ActionIcon className="w-10 h-10" />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-black uppercase tracking-tight">{action.title}</h3>
          <p className="text-sm opacity-80 leading-relaxed font-semibold">
            {action.message}
          </p>
        </div>
        <div className="md:ml-auto">
          {(technical?.final_url || qr?.raw_content) && (
            <a
              href={technical?.final_url || qr?.raw_content}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                className={cn(
                  "whitespace-nowrap h-14 px-8 font-black gap-2",
                  risk?.verdict === 'SAFE'
                    ? "bg-success text-black outline-none border-none"
                    : "bg-white/10 text-white"
                )}
              >
                Visit URL anyway <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default Analysis;
