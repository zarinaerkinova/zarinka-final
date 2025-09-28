import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
  baker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["available", "booked", "unavailable"],
    required: true,
  },
});

export default mongoose.model("Availability", availabilitySchema);
