import axios from "axios";

declare global {
  interface Window {
    __CONFIG__?: {
      API_URL?: string;
    };
  }
}

export const apiClient = axios.create({
  baseURL:
    window.__CONFIG__?.API_URL ||
    import.meta.env.VITE_API_URL ||
    "http://pulsar.apps.private.okd4.teh-2.snappcloud.io",
  timeout: 30000,
});
