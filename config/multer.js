const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "event_management_system",
    allowedFormats: ["jpg", "jpeg", "png"],  // ✔ correct key
    resource_type: "auto",                   // ✔ handles all files
  },
});

const upload = multer({ storage });

module.exports = upload;
