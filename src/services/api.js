import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const SCAN_RESULT_KEY = 'qrypt_scan_result';

/**
 * Stage 1: Upload image via Axios to get a scan_id
 */
export const uploadQRImage = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('image', file);

  if (options.contextHint) formData.append('context_hint', options.contextHint);
  if (options.skipVirustotal) formData.append('skip_virustotal', options.skipVirustotal);
  if (options.skipAi) formData.append('skip_ai', options.skipAi);

  try {
    const response = await axios.post(`${API_BASE}/api/v1/scan`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.scan_id;
  } catch (error) {
    const message = error.response?.data?.detail || "Failed to upload image.";
    throw new Error(message);
  }
};

export const WS_URL = import.meta.env.VITE_WS_URL || `${API_BASE.replace('http', 'ws')}/api/v1/scan/ws`;

/**
 * Stage 2: Connect to WebSocket for real-time updates
 */
export const connectScanSocket = (scanId, onMessage, onError, onComplete) => {
  const wsUrl = `${WS_URL}/${scanId}`;
  const socket = new WebSocket(wsUrl);

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.error) {
      onError(data.error);
      socket.close();
      return;
    }

    if (data.stage === 6 && data.data) {
      // Final result
      sessionStorage.setItem(SCAN_RESULT_KEY, JSON.stringify(data.data));
      onComplete(data.data);
      socket.close();
      return;
    }

    // Progress update
    onMessage(data);
  };

  socket.onerror = (error) => {
    onError("WebSocket connection failed.");
  };

  return socket;
};

/**
 * Fetch scan history from the backend
 */
export const getScanHistory = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/v1/history`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch scan history:", error);
    return [];
  }
};
