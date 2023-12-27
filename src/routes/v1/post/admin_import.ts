import { Request, Response } from "express";
import { SqliteError } from "better-sqlite3";
import { get_db, own_db, setup_own_db } from "../../../lib/custom";

export async function admin_import(_req: Request, res: Response) {
  try {
    const conn = own_db();
    conn?.exec("DROP TABLE IF EXISTS modems;");
    setup_own_db();
    const client = await get_db();
    const collection_modems = client?.db?.collection("modems");
    const modems = await collection_modems?.find({}).toArray();
    if (!modems?.length) {
      return res.status(304).json({ error: "Could not import no result." });
    }

    for (let modem of modems) {
      let {
        IMEI = "",
        http_port = "",
        name = "",
        proxy_login = "",
        proxy_password = "",
      } = modem;

      let currentTime = new Date().toISOString();
      let sold_to = null;
      let expiration = null;

      conn
        ?.prepare(
          "INSERT INTO modems (IMEI, http_port, name, user, password, sold_to, expiration_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .run(
          IMEI,
          http_port,
          name,
          proxy_login,
          proxy_password,
          sold_to,
          expiration,
          currentTime,
          currentTime
        );
    }
    conn?.close;
    client?.client.close;

    return res.status(200).json({ success: "Modems imported." });
  } catch (_e) {
    if (_e instanceof SqliteError) {
      return res.status(400).json({ error: "Unable to import." });
    }
    console.warn(_e);
    return res.status(500).json({ error: "Server Error." });
  }
}
