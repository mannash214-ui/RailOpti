"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizationMode = exports.OperatingDay = exports.TrainType = void 0;
/**
 * Supported Train Classification Categories.
 */
var TrainType;
(function (TrainType) {
    TrainType["EXPRESS"] = "Express";
    TrainType["SUPERFAST"] = "Superfast";
    TrainType["RAJDHANI"] = "Rajdhani";
    TrainType["SHATABDI"] = "Shatabdi";
    TrainType["VANDE_BHARAT"] = "Vande Bharat";
    TrainType["PASSENGER"] = "Passenger";
})(TrainType || (exports.TrainType = TrainType = {}));
/**
 * Days of the week for train scheduling operation.
 */
var OperatingDay;
(function (OperatingDay) {
    OperatingDay["MON"] = "MON";
    OperatingDay["TUE"] = "TUE";
    OperatingDay["WED"] = "WED";
    OperatingDay["THU"] = "THU";
    OperatingDay["FRI"] = "FRI";
    OperatingDay["SAT"] = "SAT";
    OperatingDay["SUN"] = "SUN";
})(OperatingDay || (exports.OperatingDay = OperatingDay = {}));
/**
 * Transit itinerary optimization filters.
 */
var OptimizationMode;
(function (OptimizationMode) {
    OptimizationMode["FASTEST"] = "FASTEST";
    OptimizationMode["BALANCED"] = "BALANCED";
    OptimizationMode["LEAST_TRANSFERS"] = "LEAST_TRANSFERS";
    OptimizationMode["MOST_RELIABLE"] = "MOST_RELIABLE";
})(OptimizationMode || (exports.OptimizationMode = OptimizationMode = {}));
