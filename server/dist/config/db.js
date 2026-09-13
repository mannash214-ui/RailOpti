"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let isConnected = false;
async function connectDB() {
    if (isConnected && mongoose_1.default.connection.readyState === 1) {
        return;
    }
    const mongodbUri = process.env.MONGODB_URI;
    if (!mongodbUri) {
        console.warn('[Database] MONGODB_URI is not set. Operating in static dataset mode.');
        return;
    }
    try {
        mongoose_1.default.set('strictQuery', true);
        console.log('[Database] Connecting to MongoDB...');
        const conn = await mongoose_1.default.connect(mongodbUri, { serverSelectionTimeoutMS: 5000 });
        isConnected = conn.connections[0].readyState === 1;
        console.log('[Database] MongoDB connection established successfully.');
    }
    catch (error) {
        console.warn('[Database] MongoDB connection failed. Operating in static dataset mode:', error?.message);
    }
}
// Connection event logging
mongoose_1.default.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB connection lost. Attempting reconnection...');
});
mongoose_1.default.connection.on('error', (err) => {
    console.error('[Database] Runtime mongoose connection error:', err);
});
