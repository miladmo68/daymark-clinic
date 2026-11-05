import express from "express";
import { ZodError } from "zod";
import { createService, AppError } from "./service.js";

export const createApp = repository => {
  const app = express();
  const service = createService(repository);
  app.use(express.json({ limit: "100kb" }));
  app.get("/api/health", (_req, res) => res.json({ ok: true, adapter: "node" }));
  app.get("/api/appointments", async (req, res, next) => { try { res.json(await service.list(req.query)); } catch (e) { next(e); } });
  app.post("/api/appointments", async (req, res, next) => { try { res.status(201).json(await service.save(req.body)); } catch (e) { next(e); } });
  app.put("/api/appointments/:id", async (req, res, next) => { try { res.json(await service.save(req.body, req.params.id)); } catch (e) { next(e); } });
  app.delete("/api/appointments/:id", async (req, res, next) => { try { res.json(await service.remove(req.params.id)); } catch (e) { next(e); } });
  app.use((error, _req, res, next) => {
    void next;
    if (error instanceof ZodError) return res.status(400).json({ error: "Invalid appointment input", details: error.flatten() });
    if (error instanceof AppError) return res.status(error.status).json({ error: error.message });
    console.error(error);
    return res.status(500).json({ error: "Unexpected server error" });
  });
  return app;
};
