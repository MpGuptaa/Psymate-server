const mongoose = require("mongoose");
const medicineSchema = new mongoose.Schema({
  id: String,
  category: String,
  categoryID: String,
  subcategory: String,
  subcategoryID: String,
  class: String,
  thumbnail: mongoose.Mixed,
  images: mongoose.Mixed,
  prescription: mongoose.Mixed,
  name: String,
  type: String,
  dosage: String,
  costPrice: Number,
  sellingPrice: String,
  duration: String,
  durationFormat: String,
  startDate: String,
  routine: String,
  instructions: String,
  discount: Number,
  company: String,
  usage: String,
  moa: String,
  pregnancyWarning: String,
  precautions: String,
  expertAdvice: String,
  sideEffects: String,
  uses: String,
  working: String,
  faq: String,
  interactions: String,
  composition: String,
  stock: Number,
  drugInterations: String,
  indications: String,
  description: String,
  pharmacokinetics: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const medicineCategorySchema = new mongoose.Schema({
  name: String,
  image: String,
  id: String,
  subcategory: [
    {
      name: String,
      id: String,
      category: String,
      categoryID: String,
      products: Number,
    },
  ],
  description: mongoose.Mixed,
});

const Medicine = mongoose.model("Medicine", medicineSchema);
const MedicineCategory = mongoose.model(
  "MedicineCategory",
  medicineCategorySchema
);

module.exports = { Medicine, MedicineCategory };
