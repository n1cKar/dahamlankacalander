import { useEffect, useState } from "react";

const KEY = "dl_admin_auth_v1";
const CHANGED = "dl-auth-changed";

// Mock credentials — change here if needed
export const ADMIN_USER = "dahamlanka";
export const ADMIN_PASS = "indrani68";

export function login(username: string, password: string): boolean {
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    localStorage.setItem(KEY, "1");
    window.dispatchEvent(new Event(CHANGED));
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(CHANGED));
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1";
}

export function useAuth() {
  const [authed, setAuthed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setAuthed(isAuthenticated());
    setHydrated(true);
    const handler = () => setAuthed(isAuthenticated());
    window.addEventListener(CHANGED, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(CHANGED, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return { authed, hydrated };
}