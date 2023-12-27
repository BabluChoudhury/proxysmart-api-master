import { own_db } from "./lib/custom";
//import { typesModemSales } from "./lib/utils/types";

async function test() {
  try {
    const conn = own_db();

    // if (conn) {
    //   conn.serialize(() => {
    //     conn.all("SELECT * FROM modems", (err: Error | null, rows: any[]) => {
    //       if (err) {
    //         console.error(err);
    //       } else {
    //         console.log(rows);
    //       }
    //     });

    //     conn.close((err: Error | null) => {
    //       if (err) {
    //         console.error(err.message);
    //       } else {
    //         console.log("Connection closed");
    //       }
    //     });
    //   });
    // } else {
    //   console.log("Connection to the database failed");
    // }

    if (conn) {
      try {
        const modemQuery = conn.prepare("SELECT * FROM modems");
        const rows = modemQuery.all();

        console.log(rows); // Display the fetched rows
      } catch (err) {
        console.error(err);
      } finally {
        conn.close();
      }
    } else {
      console.log("Connection to the database failed");
    }
  } catch (_e) {
    console.warn(_e);
  }
}
test();
