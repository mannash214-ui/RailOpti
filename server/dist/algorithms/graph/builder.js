"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphBuilder = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = require("../../config/db");
const trainStop_model_1 = require("../../models/trainStop.model");
const train_model_1 = require("../../models/train.model");
const station_model_1 = require("../../models/station.model");
const types_1 = require("./types");
const graph_1 = require("./graph");
class GraphBuilder {
    minTransferTime;
    maxTransferTime;
    constructor(options) {
        this.minTransferTime = options?.minTransferTime ?? 20;
        this.maxTransferTime = options?.maxTransferTime ?? 1440;
    }
    /**
     * Main build function that loads from DB and builds the immutable graph
     */
    async build() {
        // Reference imported models to register schemas and satisfy noUnusedLocals TS flag
        if (!train_model_1.Train.modelName || !station_model_1.Station.modelName) {
            throw new Error('Models failed to load');
        }
        // 1. Ensure DB Connection is initialized (attempt connection, fallback gracefully)
        if (mongoose_1.default.connection.readyState !== 1) {
            try {
                console.log('[GraphBuilder] Connecting to database...');
                await (0, db_1.connectDB)();
            }
            catch (err) {
                console.warn('[GraphBuilder] Database unavailable, falling back to static JSON dataset.');
            }
        }
        let stops = [];
        if (mongoose_1.default.connection.readyState === 1) {
            console.log('[GraphBuilder] Querying train stops from database...');
            stops = await trainStop_model_1.TrainStop.find()
                .populate('trainId')
                .populate('stationId')
                .exec();
        }
        if (!stops || stops.length === 0) {
            console.log('[GraphBuilder] Using static JSON dataset for graph compilation...');
            const { getStaticTrainStops, getStaticTrains, getStaticStations } = await Promise.resolve().then(() => __importStar(require('../../utils/dataLoader')));
            const rawStops = getStaticTrainStops();
            const rawTrains = getStaticTrains();
            const rawStations = getStaticStations();
            const trainMap = new Map(rawTrains.map(t => [t.trainNumber, { ...t, _id: t.trainNumber }]));
            const stationMap = new Map(rawStations.map(s => [s.stationCode, s]));
            stops = rawStops.map((stop, idx) => {
                const train = trainMap.get(stop.trainId) || { _id: stop.trainId, trainNumber: stop.trainId, trainName: `Train ${stop.trainId}`, trainType: 'Express' };
                const station = stationMap.get(stop.stationId) || { _id: stop.stationId, stationCode: stop.stationId, name: stop.stationId };
                return {
                    _id: `stop_${idx}`,
                    trainId: train,
                    stationId: station,
                    stopNumber: stop.stopNumber,
                    arrivalTime: stop.arrivalTime,
                    departureTime: stop.departureTime,
                    dayOffset: stop.dayOffset,
                    distanceFromSource: stop.distanceFromSource,
                    platform: stop.platform,
                };
            });
        }
        console.log(`[GraphBuilder] Loaded ${stops.length} TrainStop events. Building nodes...`);
        const nodesMap = new Map();
        const adjacencyList = new Map();
        // Groupings for index querying
        const stationNodesMap = new Map();
        const trainNodesMap = new Map();
        // 2. Build nodes and compute absolute day minutes
        for (const stop of stops) {
            const train = stop.trainId;
            const station = stop.stationId;
            if (!train || !station) {
                // Skip orphaned train stops if any
                continue;
            }
            const nodeId = stop._id.toString();
            // Convert times to day-offset minutes from start of Day 0
            const arrMins = this.parseTimeToMinutes(stop.arrivalTime);
            const depMins = this.parseTimeToMinutes(stop.departureTime);
            const absoluteArrivalMinutes = stop.arrivalTime === 'Source'
                ? stop.dayOffset * 1440 + depMins // Arrived at start time
                : stop.dayOffset * 1440 + arrMins;
            const absoluteDepartureMinutes = stop.departureTime === 'Destination'
                ? stop.dayOffset * 1440 + arrMins // Departure matches terminal arrival
                : stop.dayOffset * 1440 + depMins;
            const node = {
                nodeId,
                trainId: train._id.toString(),
                trainNumber: train.trainNumber,
                stationId: station._id.toString(),
                stationCode: station.stationCode,
                stationName: station.name,
                stopNumber: stop.stopNumber,
                arrivalTime: stop.arrivalTime,
                departureTime: stop.departureTime,
                dayOffset: stop.dayOffset,
                distanceFromSource: stop.distanceFromSource,
                platform: stop.platform,
                trainName: train.trainName,
                trainType: train.trainType,
                averageDelayMinutes: train.averageDelayMinutes ?? 0,
                cancellationProbability: train.cancellationProbability ?? 0.0,
                absoluteArrivalMinutes,
                absoluteDepartureMinutes,
                operatingDays: train.operatingDays || [],
            };
            nodesMap.set(nodeId, node);
            adjacencyList.set(nodeId, []);
            // Index by station Code and ID
            this.addToMultiMap(stationNodesMap, node.stationCode, node);
            this.addToMultiMap(stationNodesMap, node.stationId, node);
            // Index by train Number and ID
            this.addToMultiMap(trainNodesMap, node.trainNumber, node);
            this.addToMultiMap(trainNodesMap, node.trainId, node);
        }
        // 3. Construct TRAVEL edges (within same train sequence)
        console.log('[GraphBuilder] Constructing TRAVEL edges...');
        const trainIds = Array.from(new Set(Array.from(nodesMap.values()).map(n => n.trainId)));
        for (const tId of trainIds) {
            const trainStopsList = trainNodesMap.get(tId) || [];
            // Sort sequentially
            const sortedStops = [...trainStopsList].sort((a, b) => a.stopNumber - b.stopNumber);
            for (let i = 0; i < sortedStops.length - 1; i++) {
                const currentStop = sortedStops[i];
                const nextStop = sortedStops[i + 1];
                // travelMinutes is the time from departing currentStop to arriving at nextStop
                const travelMinutes = nextStop.absoluteArrivalMinutes - currentStop.absoluteDepartureMinutes;
                const travelEdge = {
                    type: types_1.EdgeType.TRAVEL,
                    targetNodeId: nextStop.nodeId,
                    travelMinutes: Math.max(0, travelMinutes), // Ensure non-negative
                    trainId: tId,
                };
                adjacencyList.get(currentStop.nodeId).push(travelEdge);
            }
        }
        // 4. Construct TRANSFER edges (at same stations, across different trains)
        console.log('[GraphBuilder] Constructing TRANSFER edges...');
        const stationIds = Array.from(new Set(Array.from(nodesMap.values()).map(n => n.stationId)));
        for (const sId of stationIds) {
            const stationStopsList = stationNodesMap.get(sId) || [];
            // Sort by departure time for binary search lookup
            const sortedDepartures = [...stationStopsList].sort((a, b) => a.absoluteDepartureMinutes - b.absoluteDepartureMinutes);
            for (const arrivalNode of stationStopsList) {
                const arrMins = arrivalNode.absoluteArrivalMinutes;
                const minDepTime = arrMins + this.minTransferTime;
                const maxDepTime = arrMins + this.maxTransferTime;
                // Perform Binary Search to find first departure >= minDepTime
                let low = 0;
                let high = sortedDepartures.length - 1;
                let startIdx = -1;
                while (low <= high) {
                    const mid = Math.floor((low + high) / 2);
                    if (sortedDepartures[mid].absoluteDepartureMinutes >= minDepTime) {
                        startIdx = mid;
                        high = mid - 1; // Search left to find first occurrence
                    }
                    else {
                        low = mid + 1;
                    }
                }
                // If a valid start index is found, link transfers
                if (startIdx !== -1) {
                    for (let k = startIdx; k < sortedDepartures.length; k++) {
                        const departureNode = sortedDepartures[k];
                        // Exceeds maxTransferTime window -> stop linking
                        if (departureNode.absoluteDepartureMinutes > maxDepTime) {
                            break;
                        }
                        // Avoid transfer edge to the same train
                        if (arrivalNode.trainId !== departureNode.trainId) {
                            const transferEdge = {
                                type: types_1.EdgeType.TRANSFER,
                                targetNodeId: departureNode.nodeId,
                                transferMinutes: departureNode.absoluteDepartureMinutes - arrMins,
                            };
                            adjacencyList.get(arrivalNode.nodeId).push(transferEdge);
                        }
                    }
                }
            }
        }
        console.log('[GraphBuilder] Graph compilation complete.');
        return new graph_1.ImmutableRailwayGraph(nodesMap, adjacencyList, stationNodesMap, trainNodesMap);
    }
    /**
     * Helper to parse time string HH:mm to minutes
     */
    parseTimeToMinutes(timeStr) {
        if (timeStr === 'Source' || timeStr === 'Destination') {
            return 0;
        }
        const parts = timeStr.split(':');
        if (parts.length !== 2) {
            return 0;
        }
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        return (isNaN(hours) ? 0 : hours) * 60 + (isNaN(minutes) ? 0 : minutes);
    }
    /**
     * Helper to append an element to a multi-map (Map of Arrays)
     */
    addToMultiMap(map, key, value) {
        let list = map.get(key);
        if (!list) {
            list = [];
            map.set(key, list);
        }
        list.push(value);
    }
}
exports.GraphBuilder = GraphBuilder;
