import { Request, Response } from "express";
import { own_db } from "../../../lib/custom";
import { SqliteError } from "better-sqlite3";

export async function admin_sql(req: Request, res: Response) {
  try {
    const sql = req.body?.sql;
    if (!sql) {
      return res.status(400).json({ error: "SQL command empty." });
    }
    console.log({ sql });
    const conn = own_db();
    conn?.exec(sql).close();
    return res.status(200).json({ success: "SQL executed." });
  } catch (_e) {
    console.log(_e);
    if (_e instanceof SqliteError) {
      return res.status(400).json({ error: "SQL error." });
    }
    console.warn(_e);
    return res.status(500).json({ error: "Server Error." });
  }
}
