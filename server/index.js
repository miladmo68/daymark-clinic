import mongoose from "mongoose";
import { createApp } from "./app.js";
import { jsonRepository, mongoRepository } from "./repositories.js";

const mongoUrl = process.env.MONGODB_URI;
if (mongoUrl) await mongoose.connect(mongoUrl);
const repository = mongoUrl ? mongoRepository : jsonRepository();
const port = Number(process.env.PORT || 3001);
createApp(repository).listen(port, () => console.log(`Daymark API on ${port} (${mongoUrl ? "MongoDB" : "in-memory JSON"} adapter)`));
