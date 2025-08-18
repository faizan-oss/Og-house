const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
    addFood,
    getFoods,
    updateFood,
    deleteFood,
    getFoodById
} = require("../controllers/foodController");

// Multer setup for temporary storage before Cloudinary upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Public routes (no auth required)
router.get("/", getFoods);
router.get("/:id", getFoodById);

// Admin routes (auth + admin role required)
router.post("/", protect, adminOnly, upload.single("image"), addFood);
router.put("/:id", protect, adminOnly, upload.single("image"), updateFood);
router.delete("/:id", protect, adminOnly, deleteFood);
module.exports = router;
