import { createBrowserRouter } from "react-router-dom";
import { routes } from "./config";

/**
 * Professional router instance created from the centralized configuration.
 */
export const router = createBrowserRouter(routes);
