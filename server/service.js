import { appointmentInput, queryInput } from "./model.js";

export class AppError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
const minutes = time => { const [h, m] = time.split(":").map(Number); return h * 60 + m; };
const overlap = (a, b) => minutes(a.time) < minutes(b.time) + b.duration && minutes(b.time) < minutes(a.time) + a.duration;
export const createService = repository => ({
  async list(query = {}) {
    const q = queryInput.parse(query);
    return (await repository.all()).filter(a =>
      (q.status === "all" || a.status === q.status) &&
      (q.providerId === "all" || a.providerId === q.providerId) &&
      (!q.search || `${a.patient} ${a.kind} ${a.note}`.toLowerCase().includes(q.search.toLowerCase()))).sort((a, b) => a.time.localeCompare(b.time));
  },
  async save(input, id) {
    const parsed = appointmentInput.parse(input);
    if (minutes(parsed.time) < 480 || minutes(parsed.time) + parsed.duration > 1080) throw new AppError("Choose a time between 8:00 AM and 6:00 PM.");
    const all = await repository.all();
    if (all.some(a => a.id !== id && a.providerId === parsed.providerId && a.status !== "cancelled" && parsed.status !== "cancelled" && overlap(a, parsed))) throw new AppError("Provider is already booked at that time.", 409);
    if (id && !all.some(a => a.id === id)) throw new AppError("Appointment not found.", 404);
    return repository.save({ ...parsed, id: id || crypto.randomUUID(), initials: parsed.patient.split(" ").map(x => x[0]).slice(0, 2).join("") });
  },
  async remove(id) {
    if (!(await repository.remove(id))) throw new AppError("Appointment not found.", 404);
    return { deleted: true };
  }
});
