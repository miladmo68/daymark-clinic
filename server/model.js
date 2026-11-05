import mongoose from "mongoose";
import { z } from "zod";

export const appointmentInput = z.object({
  patient: z.string().trim().min(2).max(70),
  providerId: z.enum(["amara", "lucas", "mina"]),
  kind: z.enum(["Consultation", "Follow-up", "Wellness", "Procedure"]),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  duration: z.number().int().min(15).max(120),
  status: z.enum(["confirmed", "arrived", "in_progress", "completed", "cancelled"]),
  note: z.string().max(300).default("")
});
export const queryInput = z.object({
  search: z.string().max(100).default(""),
  status: z.enum(["all", "confirmed", "arrived", "in_progress", "completed", "cancelled"]).default("all"),
  providerId: z.enum(["all", "amara", "lucas", "mina"]).default("all")
});
const schema = new mongoose.Schema({
  patient: { type: String, required: true, trim: true },
  providerId: { type: String, required: true, index: true },
  kind: { type: String, required: true },
  time: { type: String, required: true, index: true },
  duration: { type: Number, required: true },
  status: { type: String, required: true, index: true },
  note: { type: String, default: "" }
}, { timestamps: true, versionKey: false });
export const AppointmentModel = mongoose.models.Appointment || mongoose.model("Appointment", schema);
