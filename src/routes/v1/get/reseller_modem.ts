import { Request, Response } from "express";
import { own_db } from "../../../lib/custom";
import { typesModemSales, typesResellerData } from "../../../lib/utils/types";

export async function reseller_modem(req: Request, res: Response) {
  try {
    const auth_header = req.headers.authorization as string;
    const modemId = req.params?.modem_id;
    const api_key = auth_header.split(" ")[1];
    const conn = own_db();
    if (!conn) {
      return res.status(503).json({ error: "Server Busy." });
    }

    const resellerQuery = conn.prepare(
      "SELECT * FROM resellers WHERE api_key=? LIMIT 1"
    );
    const reseller = resellerQuery.all(api_key) as typesResellerData[];

    if (!reseller) {
      return res.status(401).json({ error: "Invalid API key." });
    }

    const modemQuery = conn.prepare(
      "SELECT * FROM modems WHERE (id=? OR IMEI=?) AND sold_to=? LIMIT 1"
    );
    const modem = modemQuery.get(
      modemId,
      modemId,
      reseller[0].telegram
    ) as typesModemSales;

    if (!modem) {
      return res.status(400).json({
        error: "Modem not found or not associated with this reseller.",
      });
    }

    return res.status(200).json(modem);
  } catch (_e) {
    console.warn(_e);
    return res.status(500).json({ error: "Server Error." });
  }
}
