import test from "node:test";
import assert from "node:assert/strict";
import { createService, AppError } from "../server/service.js";
import { jsonRepository } from "../server/repositories.js";
const make = () => createService(jsonRepository());
const input = { patient: "Elena Morris", providerId: "amara", kind: "Consultation", time: "09:00", duration: 30, status: "confirmed", note: "Follow up" };

test("creates, queries, edits and deletes appointments", async () => {
  const s = make();
  const a = await s.save(input);
  assert.equal((await s.list({ search: "elena" })).length, 1);
  assert.equal((await s.list({ providerId: "lucas" })).length, 0);
  const edited = await s.save({ ...input, patient: "Elena M.", time: "10:00" }, a.id);
  assert.equal(edited.time, "10:00");
  assert.deepEqual(await s.remove(a.id), { deleted: true });
  assert.equal((await s.list()).length, 0);
});
test("rejects overlapping provider slots but permits parallel providers", async () => {
  const s = make();
  await s.save(input);
  await assert.rejects(s.save({ ...input, patient: "Avery Quinn", time: "09:15" }), e => e instanceof AppError && e.status === 409);
  assert.equal((await s.save({ ...input, patient: "Avery Quinn", providerId: "mina" })).providerId, "mina");
});
test("rejects invalid time, input and unknown IDs", async () => {
  const s = make();
  await assert.rejects(s.save({ ...input, time: "17:45" }), /between 8:00 AM and 6:00 PM/);
  await assert.rejects(s.save({ ...input, patient: "A" }));
  await assert.rejects(s.remove("missing"), e => e.status === 404);
});
test("status and search filters behave together", async () => {
  const s = make();
  await s.save(input);
  await s.save({ ...input, patient: "Noah Lee", providerId: "lucas", status: "arrived" });
  assert.equal((await s.list({ status: "arrived", search: "Noah" })).length, 1);
  assert.equal((await s.list({ status: "confirmed", search: "Noah" })).length, 0);
});
