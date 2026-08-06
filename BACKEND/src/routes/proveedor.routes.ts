import { Router } from "express";
import { listarProveedores } from "../controllers/proveedor.controller";

const router = Router();

router.get("/", listarProveedores);

export default router;
