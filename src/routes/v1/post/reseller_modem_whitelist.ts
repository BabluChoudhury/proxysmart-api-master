import { Request, Response } from "express";

import { get_db, own_db } from "../../../lib/custom";
import { typesModemSales, typesResellerData } from "../../../lib/utils/types";

export async function reseller_modem_whitelist(req: Request, res: Response) {
  try {
    const auth_header = req.headers.authorization as string;
    const api_key = auth_header.split(" ")[1];
    const modem_id = req.params.modem_id;
    const conn = own_db();

    if (!conn) {
      return res.status(503).json({ error: "Server Busy!" });
    }

    const reseller = conn
      ?.prepare("SELECT * FROM resellers WHERE api_key=? LIMIT 1")
      .get(api_key) as typesResellerData;
    if (!reseller) {
      return res.status(401).json({ error: "Invalid API key." });
    }
    const modem = conn
      ?.prepare("SELECT * FROM modems WHERE (id=? OR IMEI=?) AND sold_to=?")
      .get(modem_id, modem_id, reseller?.telegram) as typesModemSales;
    if (!modem) {
      return res.status(404).json({
        error: "Modem not found or not associated with this reseller.",
      });
    }

    const currentDate = new Date();

    if (
      modem.expiration_date !== null &&
      new Date(modem?.expiration_date) < currentDate
    ) {
      return res.json({ error: "Modem expired." });
    }

    const action = req.body.action;
    const ip = req.body.ip;
    if (action === "add") {
      const client = await get_db();
      const collection_modems = client?.db?.collection("modems");
      collection_modems?.updateOne(
        { IMEI: modem?.IMEI },
        { $push: { white_list: ip } }
      );
      return res.status(201).json({ success: "IP successfully added." });
    } else if (action === "remove") {
      const client = await get_db();
      const collection_modems = client?.db?.collection("modems");
      collection_modems?.updateOne(
        { IMEI: modem?.IMEI },
        { $pull: { white_list: ip } }
      );
      return res.status(201).json({ success: "IP successfully removed." });
    } else if (action === "clear") {
      const client = await get_db();
      const collection_modems = client?.db?.collection("modems");
      collection_modems?.updateOne({ IMEI: modem?.IMEI }, { $set: [] });
      return res.status(201).json({ success: "Whitelist cleared." });
    } else {
      return res.status(401).json({ error: "Invalid action." });
    }
  } catch (_e) {
    console.warn(_e);
    return res.status(500).json({ error: "Server Error." });
  }
}
