import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  SearchX,
  Loader2
} from 'lucide-react';
import { getScanHistory } from '../services/api';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const History = () => {
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getScanHistory();
        setScans(data || []);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredScans = scans.filter(scan => {
    const matchesFilter = filter === 'ALL' ||
      (filter === 'SAFE' && scan.verdict === 'SAFE') ||
      (filter === 'RISKY' && ['MEDIUM_RISK', 'HIGH_RISK', 'CRITICAL'].includes(scan.verdict));
    const matchesSearch = scan.domain.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getVerdictIcon = (verdict) => {
    if (verdict === 'SAFE') return ShieldCheck;
    if (['HIGH_RISK', 'CRITICAL'].includes(verdict)) return ShieldAlert;
    return AlertTriangle;
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black">Scan History</h1>
          <p className="text-text-secondary">Track and manage your past forensic analysis reports</p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-primary/50 transition-colors text-sm"
            />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex p-1.5 glass rounded-2xl w-full max-w-md">
        {['ALL', 'SAFE', 'RISKY'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-300 ${filter === f ? "bg-primary text-black shadow-lg" : "text-text-secondary hover:text-text-primary"
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* History List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 glass rounded-3xl">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-text-secondary font-medium">Fetching scan history...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredScans.length > 0 ? (
              filteredScans.map((scan, index) => {
                const Icon = getVerdictIcon(scan.verdict);
                return (
                  <motion.div
                    key={scan.scan_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate('/analysis')}
                    className="group glass p-5 rounded-2xl flex flex-col md:flex-row items-center gap-6 cursor-pointer hover:border-primary/30 transition-all active:scale-[0.99]"
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors 
                    ${scan.verdict === 'SAFE' ? 'bg-success/10 text-success' :
                        scan.verdict === 'LOW_RISK' ? 'bg-primary/10 text-primary' :
                          'bg-danger/10 text-danger'}`}>
                      <Icon className="w-7 h-7" />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{scan.domain}</h3>
                      <p className="text-xs text-text-secondary font-mono">
                        {new Date(scan.timestamp).toLocaleDateString()} at {new Date(scan.timestamp).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6">
                      <div className="text-center">
                        <span className="text-[10px] uppercase font-bold text-text-secondary block mb-1">Risk Score</span>
                        <span className={`text-xl font-black font-mono 
                        ${scan.risk_score < 40 ? 'text-success' : scan.risk_score < 70 ? 'text-warning' : 'text-danger'}`}>
                          {scan.risk_score}
                        </span>
                      </div>

                      <Badge variant={scan.verdict.toLowerCase()}>
                        {scan.verdict.replace('_', ' ')}
                      </Badge>

                      <Button variant="ghost" className="p-2 h-auto rounded-xl">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center space-y-4 glass rounded-3xl"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <SearchX className="w-10 h-10 text-text-secondary" />
                </div>
                <h3 className="text-xl font-bold">No scans found</h3>
                <p className="text-text-secondary">Try adjusting your filters or search query</p>
                <Button onClick={() => { setFilter('ALL'); setSearch(''); }} variant="secondary">
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default History;
