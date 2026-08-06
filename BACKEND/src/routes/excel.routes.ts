import { Router } from "express";
import { exportarExcel } from "../controllers/excel.controller";

const router = Router();

router.get("/exportar-stock", exportarExcel);

export default router;
