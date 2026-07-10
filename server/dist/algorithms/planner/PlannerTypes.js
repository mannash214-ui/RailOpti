"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatMinutesToTime = formatMinutesToTime;
/**
 * Format absolute minutes from Day 0, 00:00 to HH:mm (Day X)
 */
function formatMinutesToTime(totalMinutes) {
    const day = Math.floor(totalMinutes / 1440);
    const remainingMinutes = totalMinutes % 1440;
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return `Day ${day} ${timeStr}`;
}
