"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environmental parameters
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
async function bootstrap() {
    console.log('[System] Initializing OptiRail Backend Server bootstrap...');
    // 1) Initialize DB Connection
    await (0, db_1.connectDB)();
    // 2) Listen on Port
    app_1.default.listen(PORT, () => {
        console.log(`[Server] Listening on http://localhost:${PORT}`);
        console.log(`[Server] Mode: ${process.env.NODE_ENV || 'development'}`);
    });
}
bootstrap().catch((error) => {
    console.error('[System] Fatal error during startup:', error);
    process.exit(1);
});
