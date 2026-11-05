import { cloneSeed } from "./data";
import type { ClinicState } from "./domain";

const KEY = "daymark-clinic-v1";
export const readState = (): ClinicState => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const value: unknown = JSON.parse(raw);
      if (value && typeof value === "object" && "appointments" in value && Array.isArray(value.appointments) && "activity" in value && Array.isArray(value.activity)) return value as ClinicState;
    }
  } catch { /* A damaged browser cache falls back to original data. */ }
  return cloneSeed();
};
export const saveState = (value: ClinicState) => localStorage.setItem(KEY, JSON.stringify(value));
export const clearState = () => localStorage.removeItem(KEY);
