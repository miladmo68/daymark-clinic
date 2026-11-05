export type Status = "confirmed" | "arrived" | "in_progress" | "completed" | "cancelled";
export type Kind = "Consultation" | "Follow-up" | "Wellness" | "Procedure";
export type Provider = { id: string; name: string; role: string; initials: string; color: string; room: string };
export type Appointment = { id: string; patient: string; initials: string; providerId: string; kind: Kind; time: string; duration: number; status: Status; note: string };
export type ClinicState = { appointments: Appointment[]; activity: { id: string; at: string; text: string }[] };

export const minutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};
export const clock = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return `${(h % 12) || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
export const endTime = (a: Pick<Appointment, "time" | "duration">) => {
  const total = minutes(a.time) + a.duration;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};
export const overlaps = (a: Pick<Appointment, "time" | "duration">, b: Pick<Appointment, "time" | "duration">) =>
  minutes(a.time) < minutes(b.time) + b.duration && minutes(b.time) < minutes(a.time) + a.duration;
export const hasConflict = (all: Appointment[], next: Appointment) => all.some(a =>
  a.id !== next.id && a.providerId === next.providerId && a.status !== "cancelled" && next.status !== "cancelled" && overlaps(a, next));
export const appointmentError = (all: Appointment[], a: Appointment) => {
  if (a.patient.trim().length < 2) return "Enter a patient name with at least two characters.";
  if (minutes(a.time) < 8 * 60 || minutes(endTime(a)) > 18 * 60) return "Choose a time between 8:00 AM and 6:00 PM.";
  if (hasConflict(all, a)) return "This provider already has an appointment at that time.";
  return "";
};
export const matches = (a: Appointment, query: string, status: string, provider: string) =>
  (status === "all" || a.status === status) &&
  (provider === "all" || a.providerId === provider) &&
  (!query || `${a.patient} ${a.kind} ${a.note}`.toLowerCase().includes(query.toLowerCase()));
export const utilization = (all: Appointment[], providerId: string) => {
  const busy = all.filter(a => a.providerId === providerId && a.status !== "cancelled").reduce((n, a) => n + a.duration, 0);
  return Math.min(100, Math.round(busy / 480 * 100));
};
export const countByStatus = (all: Appointment[], status: Status) => all.filter(a => a.status === status).length;
export const KIND_COLORS: Record<Kind, string> = {
  Consultation: "sage", "Follow-up": "blue", Wellness: "peach", Procedure: "plum"
};
