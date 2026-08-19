import { Router } from "express";
import {
  getRemitos,
  getRemitoPorId,
  postRemito,
  putRemito,
  getSiguienteLote,
  listarOrigenes,
} from "../controllers/remitos.controller";

const router = Router();

router.get("/remitos", getRemitos);
// Antes de /remitos/:id para que "siguiente-lote"/"origenes" no sean
// capturados como id.
router.get("/remitos/origenes", listarOrigenes);
router.get("/remitos/siguiente-lote", getSiguienteLote);
router.get("/remitos/:id", getRemitoPorId);
router.post("/remitos", postRemito);
router.put("/remitos/:id", putRemito);

export default router;
