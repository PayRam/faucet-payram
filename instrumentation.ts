import "reflect-metadata";
import { logConfigValidation } from "./lib/config-validator";

// Validate configuration on startup
if (process.env.NODE_ENV !== "production") {
  logConfigValidation();
}

console.log("✓ Server configuration loaded");
