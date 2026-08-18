import { Router } from "express";
import {
  getRemitos,
  getRemitoPorId,
  postRemito,
  putRemito,
} from "../controllers/remitos.controller";

const router = Router();

router.get("/remitos", getRemitos);
router.get("/remitos/:id", getRemitoPorId);
router.post("/remitos", postRemito);
router.put("/remitos/:id", putRemito);

export default router;
