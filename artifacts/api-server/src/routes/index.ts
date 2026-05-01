import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import drinksRouter from "./drinks";
import ingredientsRouter from "./ingredients";
import ordersRouter from "./orders";
import stockRouter from "./stock";
import dashboardRouter from "./dashboard";
import catalogRouter from "./catalog";
import drinkCategoriesRouter from "./drink-categories";
import kitchenStationsRouter from "./kitchen-stations";
import settingsRouter from "./settings";
import predefinedSlotsRouter from "./predefined-slots";
import usersRouter from "./users";
import discountsRouter from "./discounts";
import customersRouter from "./customers";
import cashierSessionsRouter from "./cashier-sessions";
import adminRouter from "./admin";
import stockAuditsRouter from "./stock-audits";
import rolesRouter from "./roles";
import { addSseClient } from "../lib/sse";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(drinksRouter);
router.use(ingredientsRouter);
router.use(ordersRouter);
router.use(stockRouter);
router.use(dashboardRouter);
router.use(catalogRouter);
router.use(drinkCategoriesRouter);
router.use(kitchenStationsRouter);
router.use(settingsRouter);
router.use(predefinedSlotsRouter);
router.use(usersRouter);
router.use(discountsRouter);
router.use(customersRouter);
router.use(cashierSessionsRouter);
router.use(adminRouter);
router.use(stockAuditsRouter);
router.use("/roles", rolesRouter);

// Server-Sent Events endpoint for real-time order push
router.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Send initial connected confirmation
  res.write("event: connected\ndata: {}\n\n");

  addSseClient(res);
});

export default router;
