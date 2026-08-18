import { Router } from "express";
import {
  getRemitos,
  postRemito,
  putRemito,
} from "../controllers/remitos.controller";

const router = Router();

router.get("/remitos", getRemitos);
router.post("/remitos", postRemito);
router.put("/remitos/:id", putRemito);

export default router;
