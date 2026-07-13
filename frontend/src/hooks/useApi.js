import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../services/api';

export function useApi(url, options = {}) {
  const { immediate = false, method = 'GET', data = null } = options;
  const [state, setState] = useState({ data: null, loading: immediate, error: null });
  const abortRef = useRef(null);

  const execute = useCallback(async (overrideData) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const config = {
        url,
        method,
        signal: controller.signal,
      };
      if (overrideData || data) {
        config.data = overrideData || data;
      }
      const response = await api(config);
      setState({ data: response.data, loading: false, error: null });
      return response.data;
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      setState({ data: null, loading: false, error: err.response?.data?.message || err.message });
      throw err;
    }
  }, [url, method, data]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [immediate, execute]);

  return { ...state, execute };
}
