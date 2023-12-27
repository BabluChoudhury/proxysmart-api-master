import { Request, Response } from "express";
import { own_db } from "../../../lib/custom";
import { typesModemSales, typesResellerData } from "../../../lib/utils/types";

export async function reseller_modem_proxies(req: Request, res: Response) {
  try {
    const auth_header = req.headers.authorization as string;
    const modemId = req.params.modem_id;
    const api_key = auth_header.split(" ")[1];

    const conn = own_db();
    const reseller = conn
      ?.prepare("SELECT * FROM resellers WHERE api_key=? LIMIT 1")
      .get(api_key) as typesResellerData;

    if (!reseller) {
      return res.status(401).json({ error: "Invalid API key." });
    }

    const modem = conn
      ?.prepare("SELECT * FROM modems WHERE (id=? OR IMEI=?) AND sold_to=?")
      .get(modemId, modemId, reseller?.telegram) as typesModemSales;

    if (!modem || !modem?.sold_to) {
      return res.status(404).json({
        error: "Modem not found or not associated with this reseller.",
      });
    }

    if (
      modem?.expiration_date !== null &&
      new Date(modem?.expiration_date) < new Date()
    ) {
      return res.status(400).json({ error: "Modem expired." });
    }

    conn?.close();
    return res
      .status(200)
      .end(`${modem?.http_port}:${modem?.user}:${modem?.sold_to}`);
  } catch (_e) {
    console.warn(_e);
    return res.status(500).json({ error: "Server Error." });
  }
}
