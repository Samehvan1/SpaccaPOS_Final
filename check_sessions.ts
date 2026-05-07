import { db, cashierSessionsTable } from "@workspace/db";
import { isNull, desc } from "drizzle-orm";

async function checkSessions() {
  const openSessions = await db
    .select()
    .from(cashierSessionsTable)
    .where(isNull(cashierSessionsTable.endedAt))
    .orderBy(desc(cashierSessionsTable.startedAt));
  
  console.log("Open Sessions:", JSON.stringify(openSessions, null, 2));
  process.exit(0);
}

checkSessions();
