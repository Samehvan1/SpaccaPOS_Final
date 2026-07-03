import { getDayOfYear, getCairoStartOfDay } from "../artifacts/api-server/src/routes/orders";

const now = new Date();
console.log("Current time (UTC):", now.toISOString());
console.log("Current day of year:", getDayOfYear(now));

const startOfDay = getCairoStartOfDay(now);
console.log("Cairo start of day (UTC):", startOfDay.toISOString());
console.log("Cairo start of day (Local):", startOfDay.toString());
