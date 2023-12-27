import { Request, Response } from "express";

import { own_db } from "../../../lib/custom";
import { typesModemSales, typesResellerData } from "../../../lib/utils/types";

export async function admin_reseller_modem(req: Request, res: Response) {
  try {
    const reseller_id = req.params.reseller_id;
    const conn = own_db();
    if (!conn) {
      return res.status(503).json({ error: "Server Busy!" });
    }
    const reseller = conn
      ?.prepare("SELECT * FROM resellers WHERE id=?")
      .get(reseller_id) as typesResellerData;
    if (!reseller) {
      return res.status(404).json({ error: "Reseller not found." });
    }

    const modems = conn
      .prepare("SELECT * FROM modems WHERE sold_to=?")
      .all(reseller?.telegram) as typesModemSales[];

    return res.status(200).json(modems);
  } catch (_e) {
    console.warn(_e);
    return res.status(500).json({ error: "Server Error." });
  }
}
