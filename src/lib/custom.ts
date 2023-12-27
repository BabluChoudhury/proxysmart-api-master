import { MongoClient } from "mongodb";
//import sqlite3 from "sqlite3";
import betterSqlite3 from "better-sqlite3";

export async function get_db() {
  try {
    // Connection URL
    const db_url = process.env.MONGO_STRING_URL;

    const client = new MongoClient(db_url!);
    // Database Name
    const dbName = "proxysmart";
    await client.connect();
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    return { client, db };
  } catch (_e) {
    console.error(_e);
  }
}

export function own_db() {
  try {
    //const sqliteDb = new sqlite3.Database("proxysmart.db");
    const sqliteDb = betterSqlite3("proxysmart.db", { verbose: console.log });
    return sqliteDb;
  } catch (_e) {
    console.error(_e);
  }
}

export function setup_own_db() {
  try {
    const sqliteDb = own_db();
    if (!sqliteDb) return;
    sqliteDb.exec(`CREATE TABLE IF NOT EXISTS resellers (
          id INTEGER PRIMARY KEY,
          telegram TEXT,
          api_key TEXT,
          balance INTEGER,
          created_at TEXT,
          updated_at TEXT,
          sold_modems INTEGER
        )`);
    sqliteDb.exec(`CREATE TABLE IF NOT EXISTS modems (
          id INTEGER PRIMARY KEY,
          IMEI TEXT,
          http_port TEXT,
          name TEXT,
          user TEXT,
          password TEXT,
          sold_to TEXT,
          expiration_date TEXT,
          created_at TEXT,
          updated_at TEXT
        )`);
    sqliteDb.exec(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        duration INTEGER,
        price INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT
    )`);
  } catch (_e) {
    console.error(_e);
  }
}
