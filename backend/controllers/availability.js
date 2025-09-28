import Availability from "../models/Availability.js";

// @desc    Get baker availability
// @route   GET /api/availability/:bakerId
// @access  Public
export const getAvailability = async (req, res) => {
  try {
    const availability = await Availability.find({ baker: req.params.bakerId });
    res.json(availability);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Set baker availability
// @route   POST /api/availability
// @access  Private (Baker)
export const setAvailability = async (req, res) => {
  const { date, status } = req.body;

  try {
    let availability = await Availability.findOne({ baker: req.user.id, date });

    if (availability) {
      // Update status
      availability.status = status;
      await availability.save();
    } else {
      // Create new availability
      availability = new Availability({
        baker: req.user.id,
        date,
        status,
      });
      await availability.save();
    }

    res.json(availability);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
