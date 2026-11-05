import type { Appointment, ClinicState, Provider } from "./domain";

export const providers: Provider[] = [
  { id: "amara", name: "Dr. Amara Singh", role: "Family physician", initials: "AS", color: "sage", room: "Room 01" },
  { id: "lucas", name: "Dr. Lucas Chen", role: "Internal medicine", initials: "LC", color: "blue", room: "Room 02" },
  { id: "mina", name: "Mina Patel, NP", role: "Nurse practitioner", initials: "MP", color: "peach", room: "Room 03" }
];

const appointment = (id: string, patient: string, providerId: string, kind: Appointment["kind"], time: string, duration: number, status: Appointment["status"], note = ""): Appointment => ({
  id, patient, initials: patient.split(" ").map(s => s[0]).slice(0, 2).join(""), providerId, kind, time, duration, status, note
});

export const seed: ClinicState = {
  appointments: [
    appointment("a01", "Elena Morris", "amara", "Consultation", "08:30", 45, "completed", "Annual care review"),
    appointment("a02", "Noah Thompson", "lucas", "Follow-up", "08:45", 30, "completed", "Blood pressure check"),
    appointment("a03", "Priya Shah", "mina", "Wellness", "09:00", 45, "completed", "Preventive screening"),
    appointment("a04", "Oliver Brooks", "amara", "Follow-up", "09:30", 30, "arrived", "Review test results"),
    appointment("a05", "Sophia Nguyen", "lucas", "Consultation", "09:45", 45, "in_progress", "New patient intake"),
    appointment("a06", "Mateo Rivera", "mina", "Consultation", "10:00", 45, "arrived", "Care plan"),
    appointment("a07", "Ava Williams", "amara", "Procedure", "10:30", 60, "confirmed", "Minor procedure"),
    appointment("a08", "Liam Patel", "lucas", "Follow-up", "11:00", 30, "confirmed", "Medication review"),
    appointment("a09", "Isabella Kim", "mina", "Wellness", "11:15", 45, "confirmed", "Wellness visit"),
    appointment("a10", "Ethan Wallace", "amara", "Consultation", "12:00", 45, "confirmed", "Care consultation"),
    appointment("a11", "Zoe Laurent", "lucas", "Consultation", "12:15", 45, "confirmed", "Digestive health"),
    appointment("a12", "Harper Wilson", "mina", "Follow-up", "12:30", 30, "confirmed", "Treatment follow-up"),
    appointment("a13", "Daniel Park", "amara", "Wellness", "13:15", 45, "confirmed", "Preventive care"),
    appointment("a14", "Maya Anderson", "lucas", "Procedure", "13:30", 60, "confirmed", "Outpatient procedure"),
    appointment("a15", "Arjun Mehta", "mina", "Consultation", "14:00", 45, "confirmed", "First visit"),
    appointment("a16", "Grace Bennett", "amara", "Follow-up", "14:30", 30, "confirmed", "Recovery check"),
    appointment("a17", "Leo Martin", "lucas", "Consultation", "15:15", 45, "confirmed", "Clinical review"),
    appointment("a18", "Nora Ibrahim", "mina", "Wellness", "15:30", 45, "confirmed", "Lifestyle visit")
  ],
  activity: [
    { id: "h1", at: "9:42 AM", text: "Sophia Nguyen was brought into Room 02." },
    { id: "h2", at: "9:34 AM", text: "Oliver Brooks checked in at reception." },
    { id: "h3", at: "9:05 AM", text: "Priya Shah completed her visit." },
    { id: "h4", at: "8:52 AM", text: "Noah Thompson completed his follow-up." }
  ]
};

export const cloneSeed = (): ClinicState => structuredClone(seed);
