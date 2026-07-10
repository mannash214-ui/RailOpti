"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI;
async function connectDB() {
    if (!MONGODB_URI) {
        console.error('[Database] Fatal Error: MONGODB_URI environment variable is missing.');
        throw new Error('MONGODB_URI environment variable is missing');
    }
    try {
        mongoose_1.default.set('strictQuery', true);
        console.log('[Database] Connecting to MongoDB...');
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('[Database] MongoDB connection established successfully.');
    }
    catch (error) {
        console.error('[Database] MongoDB connection failed:', error);
        throw error;
    }
}
// Connection event logging
mongoose_1.default.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB connection lost. Attempting reconnection...');
});
mongoose_1.default.connection.on('error', (err) => {
    console.error('[Database] Runtime mongoose connection error:', err);
});
