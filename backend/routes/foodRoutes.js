const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
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

// Routes
router.post("/", upload.single("image"), addFood);
router.get("/", getFoods);
router.put("/:id", upload.single("image"), updateFood);
router.delete("/:id", deleteFood);
router.get("/:id", getFoodById);
module.exports = router;
