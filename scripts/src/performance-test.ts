import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root before importing database connection
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

// Parse command line arguments
const totalRequests = parseInt(process.argv.find(arg => arg.startsWith("--requests="))?.split("=")[1] || "1000", 10);
const concurrency = parseInt(process.argv.find(arg => arg.startsWith("--concurrency="))?.split("=")[1] || "50", 10);
const keepOrders = process.argv.includes("--keep");

const port = process.env.PORT || "8080";
const targetUrl = process.argv.find(arg => arg.startsWith("--url="))?.split("=")[1] || `http://localhost:${port}`;

async function main() {
  console.log("==================================================");
  console.log("             SPACCA POS LOAD TESTER               ");
  console.log("==================================================");
  console.log(`Target URL:   ${targetUrl}`);
  console.log(`Total Orders: ${totalRequests}`);
  console.log(`Concurrency:  ${concurrency}`);
  console.log(`Keep Orders:  ${keepOrders ? "Yes" : "No (will clean up after test)"}`);
  console.log("==================================================");

  // Dynamic imports for ESM
  const { db, branchesTable, drinksTable, settingsTable, ordersTable, orderItemsTable, orderItemCustomizationsTable } = await import("../../lib/db/src/index.ts");
  const { eq, and, desc, inArray } = await import("drizzle-orm");

  // 1. Check for branches and drinks
  console.log("[Setup] Checking database for branches and drinks...");
  const [branch] = await db.select().from(branchesTable).limit(1);
  if (!branch) {
    console.error("Error: No branches found in the database. Please seed the database first.");
    process.exit(1);
  }

  const activeDrinks = await db.select().from(drinksTable).where(eq(drinksTable.isActive, true)).limit(5);
  if (activeDrinks.length === 0) {
    console.error("Error: No active drinks found in the database. Please seed the database first.");
    process.exit(1);
  }

  // 2. Temporarily enable allowNoStockSell so stock limits don't block order placement
  console.log("[Setup] Toggling allowNoStockSell setting to true...");
  const [existingSetting] = await db
    .select()
    .from(settingsTable)
    .where(and(eq(settingsTable.scope, "global"), eq(settingsTable.key, "allowNoStockSell")))
    .limit(1);

  const originalStockSetting = existingSetting?.value;
  if (!existingSetting) {
    await db.insert(settingsTable).values({
      scope: "global",
      key: "allowNoStockSell",
      value: "true"
    });
  } else if (originalStockSetting !== "true") {
    await db.update(settingsTable).set({ value: "true" }).where(eq(settingsTable.id, existingSetting.id));
  }

  // 3. Try to fetch a recent order to clone its structure
  console.log("[Setup] Constructing sample order payload...");
  let orderPayload: any = null;

  try {
    const [recentOrder] = await db.select().from(ordersTable).orderBy(desc(ordersTable.id)).limit(1);
    if (recentOrder) {
      const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, recentOrder.id));
      if (items.length > 0) {
        const itemIds = items.map(i => i.id);
        const customizations = await db.select().from(orderItemCustomizationsTable).where(inArray(orderItemCustomizationsTable.orderItemId, itemIds));
        
        const orderItemsPayload = items.map(item => {
          const itemCusts = customizations.filter(c => c.orderItemId === item.id);
          return {
            drinkId: item.drinkId,
            quantity: 1,
            selections: itemCusts.map(c => ({
              ingredientId: c.ingredientId || undefined,
              optionId: c.optionId || undefined,
              typeVolumeId: c.typeVolumeId || undefined
            }))
          };
        });

        orderPayload = {
          branchId: recentOrder.branchId,
          paymentMethod: "cash",
          amountTendered: 500,
          items: orderItemsPayload
        };
        console.log(`[Setup] Successfully cloned order structure from recent order ID: ${recentOrder.id}`);
      }
    }
  } catch (err) {
    console.warn("[Setup] Could not fetch recent orders, falling back to default drink payload.");
  }

  if (!orderPayload) {
    // Default payload using first active drink
    orderPayload = {
      branchId: branch.id,
      paymentMethod: "cash",
      amountTendered: 100,
      items: [
        {
          drinkId: activeDrinks[0].id,
          quantity: 1,
          selections: []
        }
      ]
    };
    console.log(`[Setup] Using fallback payload for drink ID: ${activeDrinks[0].id} ("${activeDrinks[0].name}")`);
  }

  // 4. Authenticate to retrieve a session cookie
  console.log("[Setup] Authenticating with the API server...");
  let sessionCookie = "";
  try {
    const loginRes = await fetch(`${targetUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "password123" })
    });
    
    if (loginRes.ok) {
      const setCookie = loginRes.headers.get("set-cookie");
      if (setCookie) {
        // Extract session cookie (connect.sid=...)
        sessionCookie = setCookie.split(";")[0];
        console.log("[Setup] Login successful! Session cookie obtained.");
      }
    } else {
      console.warn("[Setup] Authentication failed. Proceeding without active session (server will default user to ID 1).");
    }
  } catch (err: any) {
    console.warn(`[Setup] Could not reach API server for login: ${err.message}. Proceeding without active session...`);
  }

  // 5. Run the Load Test
  console.log("\n[Test] Starting order placements...");
  const createdOrderIds: number[] = [];
  const latencies: number[] = [];
  let successCount = 0;
  let failureCount = 0;
  const errors: Record<string, number> = {};

  const startTime = Date.now();
  let activePromises = 0;
  let requestsSent = 0;

  // Worker task to send a single order request
  const sendOrderRequest = async (): Promise<void> => {
    const reqIndex = ++requestsSent;
    const reqStart = Date.now();

    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (sessionCookie) {
      headers["Cookie"] = sessionCookie;
    }

    try {
      const res = await fetch(`${targetUrl}/api/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify(orderPayload)
      });

      const reqDuration = Date.now() - reqStart;
      latencies.push(reqDuration);

      if (res.ok) {
        successCount++;
        const body = await res.json() as any;
        if (body && body.id) {
          createdOrderIds.push(body.id);
        }
      } else {
        failureCount++;
        const errorText = await res.text();
        const key = `HTTP ${res.status}: ${errorText.substring(0, 100)}`;
        errors[key] = (errors[key] || 0) + 1;
      }
    } catch (err: any) {
      failureCount++;
      const reqDuration = Date.now() - reqStart;
      latencies.push(reqDuration);
      const key = `Network Error: ${err.message}`;
      errors[key] = (errors[key] || 0) + 1;
    }

    // Print progress every 10%
    const milestone = Math.floor(totalRequests / 10);
    if (reqIndex % milestone === 0 || reqIndex === totalRequests) {
      console.log(` -> Progress: ${reqIndex}/${totalRequests} orders sent (${Math.round((reqIndex / totalRequests) * 100)}%)`);
    }
  };

  // Promise-based concurrency worker pool
  const runPool = (): Promise<void> => {
    return new Promise((resolve) => {
      const next = () => {
        if (requestsSent >= totalRequests) {
          if (activePromises === 0) {
            resolve();
          }
          return;
        }

        activePromises++;
        sendOrderRequest().finally(() => {
          activePromises--;
          next();
        });
      };

      // Start initial concurrency batch
      for (let i = 0; i < Math.min(concurrency, totalRequests); i++) {
        next();
      }
    });
  };

  await runPool();

  const totalTimeMs = Date.now() - startTime;
  const totalTimeSec = totalTimeMs / 1000;
  const rps = totalRequests / totalTimeSec;

  // Latency metrics
  const sortedLatencies = latencies.sort((a, b) => a - b);
  const minLatency = sortedLatencies[0] || 0;
  const maxLatency = sortedLatencies[sortedLatencies.length - 1] || 0;
  const avgLatency = sortedLatencies.reduce((sum, val) => sum + val, 0) / (sortedLatencies.length || 1);
  const p50 = sortedLatencies[Math.floor(sortedLatencies.length * 0.5)] || 0;
  const p95 = sortedLatencies[Math.floor(sortedLatencies.length * 0.95)] || 0;
  const p99 = sortedLatencies[Math.floor(sortedLatencies.length * 0.99)] || 0;

  // 6. Print Report
  console.log("\n==================================================");
  console.log("                PERFORMANCE REPORT                ");
  console.log("==================================================");
  console.log(`Total Time:          ${totalTimeSec.toFixed(2)} seconds`);
  console.log(`Total Orders:        ${totalRequests}`);
  console.log(`Successful Orders:   ${successCount}`);
  console.log(`Failed Orders:       ${failureCount}`);
  console.log(`Success Rate:        ${((successCount / totalRequests) * 100).toFixed(2)}%`);
  console.log(`Throughput (RPS):    ${rps.toFixed(2)} req/sec`);
  console.log("-------------------------------------------------- border");
  console.log("LATENCY METRICS (ms):");
  console.log(`  Minimum:           ${minLatency} ms`);
  console.log(`  Average:           ${avgLatency.toFixed(1)} ms`);
  console.log(`  Median (P50):      ${p50} ms`);
  console.log(`  P95:               ${p95} ms`);
  console.log(`  P99:               ${p99} ms`);
  console.log(`  Maximum:           ${maxLatency} ms`);
  
  if (Object.keys(errors).length > 0) {
    console.log("--------------------------------------------------");
    console.log("ERROR SUMMARY:");
    for (const [err, count] of Object.entries(errors)) {
      console.log(`  [${count}x] ${err}`);
    }
  }
  console.log("==================================================");

  // 7. Cleanup
  try {
    // Restore original allowNoStockSell setting
    console.log("\n[Cleanup] Restoring original allowNoStockSell setting...");
    if (!existingSetting) {
      await db.delete(settingsTable).where(and(eq(settingsTable.scope, "global"), eq(settingsTable.key, "allowNoStockSell")));
    } else {
      await db.update(settingsTable).set({ value: originalStockSetting }).where(eq(settingsTable.id, existingSetting.id));
    }

    // Delete created test orders (unless --keep is provided)
    if (!keepOrders && createdOrderIds.length > 0) {
      console.log(`[Cleanup] Deleting ${createdOrderIds.length} test orders from the database...`);
      // Delete orders in chunks of 100 to avoid query parameter limit issues
      const chunkSize = 100;
      for (let i = 0; i < createdOrderIds.length; i += chunkSize) {
        const chunk = createdOrderIds.slice(i, i + chunkSize);
        await db.delete(ordersTable).where(inArray(ordersTable.id, chunk));
      }
      console.log("[Cleanup] Database cleaned successfully!");
    } else if (keepOrders) {
      console.log("[Cleanup] Keeping test orders in the database as requested.");
    }
  } catch (err: any) {
    console.error(`[Cleanup] Error during cleanup phase: ${err.message}`);
  }

  process.exit(failureCount === 0 ? 0 : 1);
}

main().catch(err => {
  console.error("Critical test runner failure:", err);
  process.exit(1);
});
