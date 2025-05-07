// import express router
import { Router } from "express";

// import routes
import ChatRouter from "./routes/Chat.route";

// create router
const router = Router();

/**
 * AUTHORISATION ROLES DESCRIPTION
 * 
 * Custom Roles
 *    "public" - Any user can access these routes even if they are not logged in
 *    "loggedInUser" - Only logged in users can access these routes
 * 
 * Cognito User Groups
 *    "admin" - Only worko admin users can access these routes
 *    "corporate-recruiter" - Only corporate recruiters can access these routes
 *    "corporate-admin" - Only corporate admin users can access these routes
 */

/**
 * Chat Routers
 * 
 * @authorisedRoles ["loggedInUser"]
 */
router.use("/chat", ChatRouter);

// export router
export default router;