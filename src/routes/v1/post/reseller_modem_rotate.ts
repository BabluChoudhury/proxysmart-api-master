import { Request, Response } from "express";

import { own_db } from "../../../lib/custom";
import { typesModemSales, typesResellerData } from "../../../lib/utils/types";

export async function reseller_modem_rotate(req: Request, res: Response) {
  try {
    const auth_header = req.headers.authorization as string;
    const modemId = req.params.modem_id;
    const api_key = auth_header.split(" ")[1];
    const conn = own_db();
    const reseller = conn
      ?.prepare("SELECT * FROM resellers WHERE api_key=?")
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
      return res.json({ error: "Modem already expired." });
    }

    const r = await fetch(
      `http://138.197.15.103:7002/apix/reset_modem_by_imei?IMEI=${modem?.IMEI}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("proxy:Viri123"),
        },
      }
    );

    if (r.ok) {
      return res.status(200).json({ Success: "Modem expired." });
    }

    return res.status(r.status).json({ error: "Unable to rotate." });
  } catch (_e) {
    console.warn(_e);
    return res.status(500).json({ error: "Server Error." });
  }
}
