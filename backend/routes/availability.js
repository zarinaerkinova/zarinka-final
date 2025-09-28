import express from "express";
import { getAvailability, setAvailability } from "../controllers/availability.js";
import { auth as protect, isBaker } from "../middleware/auth.js";

const router = express.Router();

router.get("/:bakerId", getAvailability);
router.post("/", protect, isBaker, setAvailability);

export default router;
