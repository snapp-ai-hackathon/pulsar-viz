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
    "http://localhost:8088",
  timeout: 30000,
});
