"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/optirail';
async function connectDB() {
    try {
        mongoose_1.default.set('strictQuery', true);
        await mongoose_1.default.connect(MONGO_URI);
        console.log('[Database] MongoDB connection established successfully.');
    }
    catch (error) {
        console.error('[Database] Connection failed:', error);
        process.exit(1); // Exits backend process if DB connection fails in production
    }
}
// Connection event logging
mongoose_1.default.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB connection lost. Attempting reconnection...');
});
mongoose_1.default.connection.on('error', (err) => {
    console.error('[Database] Runtime mongoose connection error:', err);
});
