import express, { Request, Response } from "express";

import "dotenv/config";

import { reseller } from "./routes/v1/get/reseller";
import { admin_reseller } from "./routes/v1/post/admin_reseller";
import { adminAuthMiddleware, simpleAuthMiddleware } from "./middlewares/auth";
import { admin_sql } from "./routes/v1/post/admin_sql";
import { admin_import } from "./routes/v1/post/admin_import";
import { reseller_modem } from "./routes/v1/get/reseller_modem";
import { admin_product } from "./routes/v1/post/admin_product";
import { reseller_products } from "./routes/v1/get/reseller_products";
import { reseller_buy_product } from "./routes/v1/post/reseller_buy_product";
import { reseller_modem_proxies } from "./routes/v1/get/reseller_modem_proxies";
import { home } from "./routes/home";
import { setup_own_db } from "./lib/custom";
import { reseller_modem_rotate } from "./routes/v1/post/reseller_modem_rotate";
import { reseller_modem_setting } from "./routes/v1/post/reseller_modem_setting";
import { admin_reseller_balance } from "./routes/v1/post/admin_reseller_balance";
import { admin_reseller_modem } from "./routes/v1/get/admin_reseller_modem";
import { reseller_modem_whitelist } from "./routes/v1/post/reseller_modem_whitelist";
import { admin_modems } from "./routes/v1/get/admin_modem";
import { balance_system } from "./routes/v1/post/balance_system"
 
const app = express();
app.use(express.json());
const PORT = 5000;

setup_own_db();

app.get("/", home);

app.get("/api/v1/reseller", simpleAuthMiddleware, reseller);

app.post("/api/v1/admin/reseller", adminAuthMiddleware, admin_reseller);

app.post("/api/v1/admin/sql", adminAuthMiddleware, admin_sql);

app.post("/api/v1/admin/import", adminAuthMiddleware, admin_import);

app.get(
  "/api/v1/reseller/modem/:modem_id",
  simpleAuthMiddleware,
  reseller_modem
);

app.post("/api/v1/admin/product", adminAuthMiddleware, admin_product);

app.get("/api/v1/reseller/products", reseller_products);

app.post(
  "/api/v1/reseller/product/:product_id",
  simpleAuthMiddleware,
  reseller_buy_product
);

app.get(
  "/api/v1/reseller/modem/:modem_id/proxies",
  simpleAuthMiddleware,
  reseller_modem_proxies
);

app.post(
  "/api/v1/reseller/modem/:modem_id/settings",
  simpleAuthMiddleware,
  reseller_modem_setting
);

app.post(
  "/api/v1/reseller/modem/:modem_id/rotate",
  simpleAuthMiddleware,
  reseller_modem_rotate
);

app.post(
  "/api/v1/admin/reseller/:reseller_id/balance",
  adminAuthMiddleware,
  admin_reseller_balance
);

app.get(
  "/api/v1/admin/reseller/:reseller_id/modems",
  adminAuthMiddleware,
  admin_reseller_modem
);
app.post(
  "/api/v1/reseller/modem/:modem_id/whitelist",
  simpleAuthMiddleware,
  reseller_modem_whitelist
);

app.post("/api/v1/admin/modems", adminAuthMiddleware, admin_modems);

app.post("",simpleAuthMiddleware,balance_system)

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err: Error, _req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
