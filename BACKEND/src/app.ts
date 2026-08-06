import express from "express";
import cors from "cors";
import remitosRouter from "./routes/remitos.routes";
import excelRoutes from "./routes/excel.routes";
import proveedorRoutes from "./routes/proveedor.routes";
import productosRoutes from "./routes/productos.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use(remitosRouter);
app.use(excelRoutes);
app.use("/proveedores", proveedorRoutes);
app.use("/productos", productosRoutes);

export default app;
