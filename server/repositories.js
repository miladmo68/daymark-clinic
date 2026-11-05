import mongoose from "mongoose";
import { AppointmentModel } from "./model.js";

export const jsonRepository = (initial = []) => {
  let rows = structuredClone(initial);
  return {
    all: async () => structuredClone(rows),
    save: async item => { rows = rows.filter(x => x.id !== item.id).concat(item); return structuredClone(item); },
    remove: async id => { const before = rows.length; rows = rows.filter(x => x.id !== id); return rows.length !== before; }
  };
};

export const mongoRepository = {
  all: async () => (await AppointmentModel.find({}).lean()).map(({ _id, ...rest }) => ({ ...rest, id: String(_id) })),
  save: async item => {
    const { id, ...payload } = item;
    const row = mongoose.isValidObjectId(id)
      ? await AppointmentModel.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
      : await AppointmentModel.create(payload);
    return { ...row.toObject(), id: String(row._id) };
  },
  remove: async id => mongoose.isValidObjectId(id) ? Boolean(await AppointmentModel.findByIdAndDelete(id)) : false
};
