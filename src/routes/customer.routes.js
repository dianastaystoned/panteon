import { Router } from "express";
import {
  createDifunto,
  deleteDifunto,
  editDifunto,
  renderDifunto,
  updateDifunto,
  exportData,
  allDifuntos
} from "../controllers/customerController.js";
const router = Router();

router.get("/", renderDifunto);
router.post("/add", createDifunto);
router.get("/update/:id", editDifunto);
router.post("/update/:id", updateDifunto);
router.get("/delete/:id", deleteDifunto);
router.get("/export-excel", exportData)
router.get("/all", allDifuntos)

export default router;
