"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateFilter = void 0;
class DuplicateFilter {
    /**
     * Filter out duplicate journeys that share the same train sequence and transfer stations.
     * Assuming the input journeys list is already sorted by score/priority descending,
     * keeping the first encounter of each unique path is guaranteed to retain the highest-ranked version.
     */
    static filter(journeys) {
        const seen = new Set();
        const result = [];
        for (let i = 0; i < journeys.length; i++) {
            const journey = journeys[i];
            const trainSequence = journey.trainSegments.map(s => s.trainNumber).join('->');
            const transferStations = journey.trainSegments.slice(0, -1).map(s => s.toStationCode).join('->');
            const signature = `${trainSequence}|${transferStations}`;
            if (!seen.has(signature)) {
                seen.add(signature);
                result.push(journey);
            }
        }
        return result;
    }
}
exports.DuplicateFilter = DuplicateFilter;
