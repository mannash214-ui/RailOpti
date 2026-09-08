"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathReconstructor = void 0;
const PlannerTypes_1 = require("./PlannerTypes");
class PathReconstructor {
    /**
     * Trace parents and compile graph nodes into formatted journey with segments
     */
    static reconstruct(parentTable, endNodeId, endTransfers, graph, userDepartureMinutes, travelDate) {
        let currNodeId = endNodeId;
        let currTransfers = endTransfers;
        const pathNodes = [];
        // Traverse backwards from target using parent pointer state map
        while (currNodeId) {
            const node = graph.getNode(currNodeId);
            if (!node)
                break;
            pathNodes.push(node);
            const parent = parentTable.get(currNodeId)?.get(currTransfers);
            if (!parent) {
                break; // reached start node
            }
            currNodeId = parent.parentNodeId;
            currTransfers = parent.parentTransfers;
        }
        if (pathNodes.length === 0) {
            return undefined;
        }
        // Reverse to establish path in chronological start-to-end order
        pathNodes.reverse();
        const startNode = pathNodes[0];
        const destinationNode = pathNodes[pathNodes.length - 1];
        const trainSegments = [];
        let travelTimeMinutes = 0;
        let waitingTimeMinutes = 0;
        // Track initial waiting time at origin station
        const startWaitingTime = startNode.absoluteDepartureMinutes - userDepartureMinutes;
        waitingTimeMinutes += Math.max(0, startWaitingTime);
        let currentSegmentStart = startNode;
        const tDate = travelDate || new Date().toISOString().split('T')[0];
        const addDaysToDate = (dateStr, days) => {
            const dateParts = dateStr.split('-');
            const year = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10) - 1;
            const day = parseInt(dateParts[2], 10);
            const date = new Date(Date.UTC(year, month, day));
            date.setUTCDate(date.getUTCDate() + days);
            return date;
        };
        const getFormattedCalendarDate = (dateStr, absoluteMinutes) => {
            const dayOffset = Math.floor(absoluteMinutes / 1440);
            const remainingMinutes = absoluteMinutes % 1440;
            const hours = Math.floor(remainingMinutes / 60);
            const mins = remainingMinutes % 60;
            const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
            const dateObj = addDaysToDate(dateStr, dayOffset);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const day = dateObj.getUTCDate();
            const month = months[dateObj.getUTCMonth()];
            const year = dateObj.getUTCFullYear();
            const shortWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const fullWeekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const utcDay = dateObj.getUTCDay();
            return {
                dateTimeStr: `${day} ${month} ${year} ${timeStr}`,
                dayLong: fullWeekdays[utcDay],
                dayShort: shortWeekdays[utcDay],
            };
        };
        for (let i = 0; i < pathNodes.length - 1; i++) {
            const curr = pathNodes[i];
            const next = pathNodes[i + 1];
            if (curr.trainId !== next.trainId) {
                // Change of train represents transfer layover
                const segmentTravel = curr.absoluteArrivalMinutes - currentSegmentStart.absoluteDepartureMinutes;
                travelTimeMinutes += segmentTravel;
                const depDateInfo = getFormattedCalendarDate(tDate, currentSegmentStart.absoluteDepartureMinutes);
                const arrDateInfo = getFormattedCalendarDate(tDate, curr.absoluteArrivalMinutes);
                trainSegments.push({
                    trainNumber: currentSegmentStart.trainNumber,
                    trainName: currentSegmentStart.trainName,
                    fromStationCode: currentSegmentStart.stationCode,
                    fromStationName: currentSegmentStart.stationName,
                    toStationCode: curr.stationCode,
                    toStationName: curr.stationName,
                    departureTime: (0, PlannerTypes_1.formatMinutesToTime)(currentSegmentStart.absoluteDepartureMinutes),
                    arrivalTime: (0, PlannerTypes_1.formatMinutesToTime)(curr.absoluteArrivalMinutes),
                    travelMinutes: segmentTravel,
                    cancellationProbability: currentSegmentStart.cancellationProbability,
                    averageDelayMinutes: currentSegmentStart.averageDelayMinutes,
                    actualDepartureDateTime: depDateInfo.dateTimeStr,
                    actualArrivalDateTime: arrDateInfo.dateTimeStr,
                });
                // Add the waiting duration of transfer layover
                const transferWait = next.absoluteDepartureMinutes - curr.absoluteArrivalMinutes;
                waitingTimeMinutes += transferWait;
                // Reset segment starting stop to the newly boarded train stop
                currentSegmentStart = next;
            }
        }
        // Add final trailing train segment
        const lastNode = pathNodes[pathNodes.length - 1];
        const finalSegmentTravel = lastNode.absoluteArrivalMinutes - currentSegmentStart.absoluteDepartureMinutes;
        travelTimeMinutes += finalSegmentTravel;
        const depDateInfoFinal = getFormattedCalendarDate(tDate, currentSegmentStart.absoluteDepartureMinutes);
        const arrDateInfoFinal = getFormattedCalendarDate(tDate, lastNode.absoluteArrivalMinutes);
        trainSegments.push({
            trainNumber: currentSegmentStart.trainNumber,
            trainName: currentSegmentStart.trainName,
            fromStationCode: currentSegmentStart.stationCode,
            fromStationName: currentSegmentStart.stationName,
            toStationCode: lastNode.stationCode,
            toStationName: lastNode.stationName,
            departureTime: (0, PlannerTypes_1.formatMinutesToTime)(currentSegmentStart.absoluteDepartureMinutes),
            arrivalTime: (0, PlannerTypes_1.formatMinutesToTime)(lastNode.absoluteArrivalMinutes),
            travelMinutes: finalSegmentTravel,
            cancellationProbability: currentSegmentStart.cancellationProbability,
            averageDelayMinutes: currentSegmentStart.averageDelayMinutes,
            actualDepartureDateTime: depDateInfoFinal.dateTimeStr,
            actualArrivalDateTime: arrDateInfoFinal.dateTimeStr,
        });
        const totalTimeMinutes = travelTimeMinutes + waitingTimeMinutes;
        const journeyDepDateInfo = getFormattedCalendarDate(tDate, startNode.absoluteDepartureMinutes);
        const journeyArrDateInfo = getFormattedCalendarDate(tDate, destinationNode.absoluteArrivalMinutes);
        return {
            departureStation: startNode.stationName,
            departureStationCode: startNode.stationCode,
            destinationStation: destinationNode.stationName,
            destinationStationCode: destinationNode.stationCode,
            departureTime: (0, PlannerTypes_1.formatMinutesToTime)(startNode.absoluteDepartureMinutes),
            arrivalTime: (0, PlannerTypes_1.formatMinutesToTime)(destinationNode.absoluteArrivalMinutes),
            totalTimeMinutes,
            travelTimeMinutes,
            waitingTimeMinutes,
            transferCount: endTransfers,
            reliabilityScore: 0,
            overallScore: 0,
            trainSegments,
            travelDate: tDate,
            actualDepartureDateTime: journeyDepDateInfo.dateTimeStr,
            actualArrivalDateTime: journeyArrDateInfo.dateTimeStr,
            arrivalDay: journeyArrDateInfo.dayShort,
            departureDay: journeyDepDateInfo.dayShort,
        };
    }
}
exports.PathReconstructor = PathReconstructor;
