import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, LayoutGrid, AlertCircle } from 'lucide-react';
import CameraScanner from '../components/scan/CameraScanner';
import ImageUploader from '../components/scan/ImageUploader';
import StageProgress from '../components/scan/StageProgress';
import { cn } from '../components/ui/Button';
import { uploadQRImage, connectScanSocket } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Scanner = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('camera'); // 'camera' | 'upload'
  const [isScanning, setIsScanning] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [contextHint, setContextHint] = useState('');
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState(null);

  const handleScan = async (file) => {
    setError(null);
    setIsScanning(true);

    try {
      // 1. Upload via Axios -> get scan_id
      const scanId = await uploadQRImage(file, { contextHint });

      // 2. Show progress UI
      setShowProgress(true);

      // 3. Connect WebSocket for real-time stages
      connectScanSocket(
        scanId,
        (msg) => {
          if (msg.stage) setCurrentStage(msg.stage);
        },
        (err) => {
          setError(err);
          setIsScanning(false);
          setShowProgress(false);
        },
        (result) => {
          // Complete!
          navigate('/analysis');
        }
      );
    } catch (err) {
      console.error('Scan error:', err);
      setIsScanning(false);
      setShowProgress(false);
      setError(err.message || 'Scan failed. Please try again.');
    }
  };

  const handleProgressComplete = () => {
    // StageProgress now controlled by WebSocket;
    // Navigation is handled in connectScanSocket onComplete.
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black">Security Scanner</h1>
        <p className="text-text-secondary">Choose your scan method to begin forensic analysis</p>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400/60 hover:text-red-400 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!showProgress ? (
          <motion.div
            key="interface"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            {/* Tabs */}
            <div className="flex p-1.5 glass rounded-2xl w-full max-w-sm mx-auto">
              <button
                onClick={() => setMode('camera')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300",
                  mode === 'camera' ? "bg-primary text-black font-bold shadow-lg" : "text-text-secondary hover:text-text-primary"
                )}
              >
                <Camera className="w-4 h-4" />
                Live Camera
              </button>
              <button
                onClick={() => setMode('upload')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300",
                  mode === 'upload' ? "bg-primary text-black font-bold shadow-lg" : "text-text-secondary hover:text-text-primary"
                )}
              >
                <Upload className="w-4 h-4" />
                Upload Image
              </button>
            </div>

            {/* Context Hint */}
            <div className="max-w-sm mx-auto">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">
                Context Hint <span className="opacity-50 normal-case">(optional — e.g. "bank poster", "restaurant menu")</span>
              </label>
              <input
                type="text"
                value={contextHint}
                onChange={(e) => setContextHint(e.target.value)}
                placeholder="Describe where you found this QR code…"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Main Surface */}
            <div className="glass rounded-[32px] p-8 sm:p-12 min-h-[500px] flex flex-col items-center justify-center">
              {mode === 'camera' ? (
                <div className="space-y-8 w-full text-center">
                  <CameraScanner isScanning={isScanning} onScanComplete={handleScan} />
                  {!isScanning && (
                    <div className="animate-bounce inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-sm font-bold uppercase tracking-widest text-primary">
                      Position QR to Scan
                    </div>
                  )}
                </div>
              ) : (
                <ImageUploader onUpload={handleScan} />
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="progress"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-[32px] p-12 sm:p-20 flex flex-col items-center justify-center min-h-[600px]"
          >
            <div className="w-full max-w-md space-y-12">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center">
                  <LayoutGrid className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-widest">Analysis in Progress</h2>
                <p className="text-text-secondary text-sm">Our engines are running multi-layer security checks</p>
              </div>

              <StageProgress
                activeStage={currentStage}
                onComplete={handleProgressComplete}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
};

export default Scanner;
