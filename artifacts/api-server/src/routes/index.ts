import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import { authRouter } from "./auth.js";
import { propertiesRouter } from "./properties.js";
import { articlesRouter } from "./articles.js";
import { enquiriesRouter } from "./enquiries.js";
import { siteVisitsRouter } from "./siteVisits.js";
import { mediaRouter } from "./media.js";
import { settingsRouter } from "./settings.js";
import { homepageRouter } from "./homepage.js";
import { dashboardRouter } from "./dashboard.js";
import { newsletterRouter } from "./newsletter.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/dashboard", dashboardRouter);
router.use("/properties", propertiesRouter);
router.use("/articles", articlesRouter);
router.use("/enquiries", enquiriesRouter);
router.use("/site-visits", siteVisitsRouter);
router.use("/media", mediaRouter);
router.use("/settings", settingsRouter);
router.use("/homepage", homepageRouter);
router.use("/newsletter", newsletterRouter);

export default router;
