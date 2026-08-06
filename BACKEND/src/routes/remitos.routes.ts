import { Router } from "express";
import { getRemitos, postRemito } from "../controllers/remitos.controller";

const router = Router();

router.get("/remitos", getRemitos);
router.post("/remitos", postRemito);

export default router;
