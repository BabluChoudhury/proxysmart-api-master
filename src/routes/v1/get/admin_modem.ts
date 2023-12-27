import { Response, Request } from "express";

import { own_db } from "../../../lib/custom";
import { typesModemSales } from "../../../lib/utils/types";

export async function admin_modems(_req: Request, res: Response) {
  try {
    const conn = own_db();
    if (!conn) {
      return res.status(503).json({ error: "Server Busy!" });
    }
    const modemsQuery: any = conn.prepare("SELECT * FROM modems");
    const modems = modemsQuery.all() as typesModemSales[];

    const modems_list = [];
    modems_list.push({ total_modems: modems.length });
    const unsold_modems = conn
      ?.prepare(
        "SELECT COUNT(*) FROM modems WHERE sold_to IS NULL OR expiration_date IS NULL OR expiration_date < ?"
      )
      .get([new Date().toISOString()]);
    modems_list.push({ unsold_modems });
    modems.map((modem) => {
      modems_list.push({
        id: modem?.id,
        IMEI: modem?.IMEI,
        http_port: modem?.http_port,
        name: modem?.name,
        user: modem?.user,
        password: modem?.password,
        sold_to: modem?.sold_to,
        created_at: modem?.created_at,
        updated_at: modem?.updated_at,
      });
    });

    return res.status(200).json(modems_list);
  } catch (_e) {
    console.warn(_e);
    return res.status(500).json({ error: "Server Error." });
  }
}
