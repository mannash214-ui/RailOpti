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
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// 1. COMPACT GEOGRAPHICAL STATION DICTIONARY
// Over 300 realistic stations covering West Bengal, Assam, Bihar, Odisha, Jharkhand, Tripura, etc.
const STATIONS_RAW = [
    // West Bengal (ER / SER / NFR)
    ['HWH', 'Howrah Junction', 'Kolkata', 'West Bengal', 'ER', true, 22.5833, 88.3424],
    ['SDAH', 'Sealdah', 'Kolkata', 'West Bengal', 'ER', true, 22.5697, 88.3712],
    ['KOAA', 'Kolkata Chitpur', 'Kolkata', 'West Bengal', 'ER', true, 22.5982, 88.3789],
    ['SHM', 'Shalimar', 'Howrah', 'West Bengal', 'SER', false, 22.5594, 88.3183],
    ['SRC', 'Santragachi Junction', 'Howrah', 'West Bengal', 'SER', true, 22.5714, 88.2917],
    ['KGP', 'Kharagpur Junction', 'Kharagpur', 'West Bengal', 'SER', true, 22.3302, 87.3237],
    ['MDN', 'Midnapore', 'Midnapore', 'West Bengal', 'SER', false, 22.4172, 87.3275],
    ['BWN', 'Bardhaman Junction', 'Bardhaman', 'West Bengal', 'ER', true, 23.2389, 87.8614],
    ['DGR', 'Durgapur', 'Durgapur', 'West Bengal', 'ER', false, 23.4984, 87.3106],
    ['RNG', 'Raniganj', 'Asansol', 'West Bengal', 'ER', false, 23.6121, 87.1124],
    ['ASN', 'Asansol Junction', 'Asansol', 'West Bengal', 'ER', true, 23.6828, 86.9749],
    ['BHP', 'Bolpur Shantiniketan', 'Bolpur', 'West Bengal', 'ER', false, 23.6657, 87.6934],
    ['RPH', 'Rampurhat Junction', 'Rampurhat', 'West Bengal', 'ER', true, 24.1683, 87.7816],
    ['NHT', 'Nalhati Junction', 'Nalhati', 'West Bengal', 'ER', true, 24.2982, 87.8341],
    ['MLDT', 'Malda Town', 'Malda', 'West Bengal', 'ER', true, 25.0108, 88.1362],
    ['NJP', 'New Jalpaiguri Junction', 'Siliguri', 'West Bengal', 'NFR', true, 26.6833, 88.4411],
    ['SGUJ', 'Siliguri Junction', 'Siliguri', 'West Bengal', 'NFR', true, 26.7118, 88.4316],
    ['JPE', 'Jalpaiguri Road', 'Jalpaiguri', 'West Bengal', 'NFR', false, 26.5412, 88.7410],
    ['DQG', 'Dhupguri', 'Dhupguri', 'West Bengal', 'NFR', false, 26.5910, 89.0142],
    ['NCB', 'New Cooch Behar Junction', 'Cooch Behar', 'West Bengal', 'NFR', true, 26.3402, 89.4718],
    ['NOQ', 'New Alipurduar', 'Alipurduar', 'West Bengal', 'NFR', false, 26.5050, 89.7522],
    ['ADRA', 'Adra Junction', 'Adra', 'West Bengal', 'SER', true, 23.4981, 86.6908],
    ['BQA', 'Bankura Junction', 'Bankura', 'West Bengal', 'SER', true, 23.2334, 87.0709],
    ['BDC', 'Bandel Junction', 'Bandel', 'West Bengal', 'ER', true, 22.9238, 88.3752],
    ['SHE', 'Sheoraphuli Junction', 'Serampore', 'West Bengal', 'ER', true, 22.7937, 88.3241],
    ['KWAE', 'Katwa Junction', 'Katwa', 'West Bengal', 'ER', true, 23.6429, 88.1352],
    ['AZ', 'Azimganj Junction', 'Azimganj', 'West Bengal', 'ER', true, 24.2381, 88.2435],
    ['RHA', 'Ranaghat Junction', 'Ranaghat', 'West Bengal', 'ER', true, 23.1782, 88.5638],
    ['NH', 'Naihati Junction', 'Naihati', 'West Bengal', 'ER', true, 22.9009, 88.4239],
    ['BNJ', 'Bongaon Junction', 'Bongaon', 'West Bengal', 'ER', true, 23.0450, 88.8256],
    ['HAS', 'Hasimara', 'Alipurduar', 'West Bengal', 'NFR', false, 26.7450, 89.3450],
    ['APDJ', 'Alipurduar Junction', 'Alipurduar', 'West Bengal', 'NFR', true, 26.4950, 89.5250],
    ['SM', 'Samsi', 'Malda', 'West Bengal', 'NFR', false, 25.2612, 87.9348],
    ['AUB', 'Aluabari Road Junction', 'Islampur', 'West Bengal', 'NFR', true, 26.2750, 88.1912],
    ['TKG', 'Thakurganj', 'Thakurganj', 'West Bengal', 'NFR', false, 26.4410, 88.1310],
    ['BOE', 'Barsoi Junction', 'Barsoi', 'West Bengal', 'NFR', true, 25.6410, 87.9410],
    ['DDL', 'Dalkhola', 'Dalkhola', 'West Bengal', 'NFR', false, 25.8612, 87.8540],
    ['LGL', 'Lalgola', 'Lalgola', 'West Bengal', 'ER', false, 24.4172, 88.2512],
    ['BGB', 'Budge Budge', 'Kolkata', 'West Bengal', 'ER', false, 22.4812, 88.1812],
    ['LLH', 'Liluah', 'Howrah', 'West Bengal', 'ER', false, 22.6189, 88.3412],
    ['RIS', 'Rishra', 'Hooghly', 'West Bengal', 'ER', false, 22.7118, 88.3340],
    ['SRP', 'Serampore', 'Serampore', 'West Bengal', 'ER', false, 22.7538, 88.3412],
    ['CGR', 'Chandannagar', 'Chandannagar', 'West Bengal', 'ER', false, 22.8612, 88.3612],
    ['CNS', 'Chuchura', 'Chinsurah', 'West Bengal', 'ER', false, 22.9010, 88.3840],
    ['PAN', 'Panagarh', 'Panagarh', 'West Bengal', 'ER', false, 23.4410, 87.4612],
    ['SIT', 'Sitarampur Junction', 'Asansol', 'West Bengal', 'ER', true, 23.7010, 86.8710],
    ['SLS', 'Salanpur', 'Salanpur', 'West Bengal', 'ER', false, 23.7712, 86.8812],
    ['BRR', 'Barakar', 'Barakar', 'West Bengal', 'ER', false, 23.7420, 86.8210],
    ['KAN', 'Khana Junction', 'Bardhaman', 'West Bengal', 'ER', true, 23.3421, 87.7410],
    ['FLK', 'Falakata', 'Falakata', 'West Bengal', 'NFR', false, 26.5210, 89.2140],
    ['DLK', 'Dankuni Junction', 'Hooghly', 'West Bengal', 'ER', true, 22.6840, 88.2910],
    ['BLRG', 'Balurghat', 'Balurghat', 'West Bengal', 'NFR', false, 25.2210, 88.7610],
    ['GZO', 'Gazole', 'Malda', 'West Bengal', 'NFR', false, 25.2140, 88.1910],
    ['EKI', 'Eklakhi Junction', 'Malda', 'West Bengal', 'NFR', true, 25.1740, 88.1610],
    ['RDP', 'Radhikapur', 'Dinajpur', 'West Bengal', 'NFR', false, 25.6120, 88.2640],
    ['KNE', 'Kishanganj', 'Kishanganj', 'Bihar', 'NFR', false, 26.0740, 87.9412], // Geographically borders WB/Bihar, keeping it in corridor
    ['MIG', 'Midnapore Town', 'Midnapore', 'West Bengal', 'SER', false, 22.4210, 87.3110],
    ['SLB', 'Salboni', 'Salboni', 'West Bengal', 'SER', false, 22.6410, 87.2910],
    ['CDGR', 'Chandrakona Road', 'Chandrakona', 'West Bengal', 'SER', false, 22.7412, 87.3110],
    ['GBA', 'Garhbeta', 'Garhbeta', 'West Bengal', 'SER', false, 22.8612, 87.3410],
    ['VSU', 'Bishnupur Junction', 'Bishnupur', 'West Bengal', 'SER', true, 23.0812, 87.3210],
    ['ODM', 'Ondagram', 'Bankura', 'West Bengal', 'SER', false, 23.1310, 87.2140],
    ['CJN', 'Chhatna', 'Bankura', 'West Bengal', 'SER', false, 23.3012, 86.9910],
    // Assam (NFR)
    ['GHY', 'Guwahati', 'Guwahati', 'Assam', 'NFR', true, 26.1834, 91.7516],
    ['KYQ', 'Kamakhya Junction', 'Guwahati', 'Assam', 'NFR', true, 26.1557, 91.6840],
    ['RNY', 'Rangiya Junction', 'Rangiya', 'Assam', 'NFR', true, 26.4412, 91.6310],
    ['PBL', 'Pathsala', 'Pathsala', 'Assam', 'NFR', false, 26.4950, 91.1718],
    ['BPRD', 'Barpeta Road', 'Barpeta Road', 'Assam', 'NFR', false, 26.5012, 90.9710],
    ['NBQ', 'New Bongaigaon Junction', 'Bongaigaon', 'Assam', 'NFR', true, 26.4718, 90.5412],
    ['KOJ', 'Kokrajhar', 'Kokrajhar', 'Assam', 'NFR', false, 26.4012, 90.2718],
    ['NHLG', 'New Haflong', 'Haflong', 'Assam', 'NFR', false, 25.1782, 93.0238],
    ['MBG', 'Maibang', 'Maibang', 'Assam', 'NFR', false, 25.2910, 93.1210],
    ['LMG', 'Lumding Junction', 'Lumding', 'Assam', 'NFR', true, 25.7524, 93.1849],
    ['DPU', 'Diphu', 'Diphu', 'Assam', 'NFR', false, 25.8450, 93.4250],
    ['DMV', 'Dimapur', 'Dimapur', 'Nagaland', 'NFR', false, 25.9010, 93.7218], // Nagaland main station
    ['FKG', 'Furkating Junction', 'Golaghat', 'Assam', 'NFR', true, 26.4812, 93.9712],
    ['MXN', 'Mariani Junction', 'Jorhat', 'Assam', 'NFR', true, 26.6610, 94.3210],
    ['SLGR', 'Simaluguri Junction', 'Simaluguri', 'Assam', 'NFR', true, 26.8912, 94.8110],
    ['DBRG', 'Dibrugarh', 'Dibrugarh', 'Assam', 'NFR', false, 27.4718, 94.9110],
    ['TSK', 'Tinsukia Junction', 'Tinsukia', 'Assam', 'NFR', true, 27.5012, 95.3612],
    ['LEDO', 'Ledo', 'Ledo', 'Assam', 'NFR', false, 27.3012, 95.7410],
    ['DNT', 'Dangari', 'Dangari', 'Assam', 'NFR', false, 27.6012, 95.6110],
    ['SCL', 'Silchar', 'Silchar', 'Assam', 'NFR', false, 24.8218, 92.8010],
    ['BPB', 'Badarpur Junction', 'Badarpur', 'Assam', 'NFR', true, 24.9012, 92.6210],
    ['KXJ', 'Karimganj Junction', 'Karimganj', 'Assam', 'NFR', true, 24.8612, 92.3512],
    ['HKD', 'Hailakandi', 'Hailakandi', 'Assam', 'NFR', false, 24.6812, 92.5610],
    ['KTX', 'Katakhal Junction', 'Katakhal', 'Assam', 'NFR', true, 24.8310, 92.6910],
    ['SCA', 'Salchapra', 'Salchapra', 'Assam', 'NFR', false, 24.8110, 92.7410],
    ['JID', 'Jagi Road', 'Jagi Road', 'Assam', 'NFR', false, 26.1210, 92.1310],
    ['HJI', 'Hojai', 'Hojai', 'Assam', 'NFR', false, 26.0010, 92.8510],
    ['LKA', 'Lanka', 'Lanka', 'Assam', 'NFR', false, 25.9210, 93.0012],
    ['CPK', 'Chaparmukh Junction', 'Chaparmukh', 'Assam', 'NFR', true, 26.1912, 92.5210],
    ['GLPT', 'Goalpara Town', 'Goalpara', 'Assam', 'NFR', false, 26.1712, 90.6210],
    ['AYU', 'Abhayapuri', 'Abhayapuri', 'Assam', 'NFR', false, 26.3312, 90.6610],
    ['RPAN', 'Rangapara North Junction', 'Rangapara', 'Assam', 'NFR', true, 26.8112, 92.6912],
    ['DKGN', 'Dekargaon', 'Tezpur', 'Assam', 'NFR', false, 26.6512, 92.7910],
    ['GPZ', 'Gohpur', 'Gohpur', 'Assam', 'NFR', false, 26.8812, 93.6310],
    ['VNE', 'Viswanath Charali', 'Charali', 'Assam', 'NFR', false, 26.8612, 93.1510],
    ['ULG', 'Udalguri', 'Udalguri', 'Assam', 'NFR', false, 26.7412, 92.1012],
    ['TNL', 'Tangla', 'Tangla', 'Assam', 'NFR', false, 26.5612, 91.9010],
    ['DSK', 'Duliajan', 'Duliajan', 'Assam', 'NFR', false, 27.3612, 95.3110],
    ['NHK', 'Naharkatiya', 'Naharkatiya', 'Assam', 'NFR', false, 27.2812, 95.3410],
    ['NAM', 'Namrup', 'Namrup', 'Assam', 'NFR', false, 27.1812, 95.4210],
    ['LHB', 'Lahowal', 'Dibrugarh', 'Assam', 'NFR', false, 27.4812, 95.0012],
    ['DBRT', 'Dibrugarh Town', 'Dibrugarh', 'Assam', 'NFR', false, 27.4810, 94.9010],
    ['NTS', 'New Tinsukia Junction', 'Tinsukia', 'Assam', 'NFR', true, 27.5050, 95.3610],
    ['AGI', 'Amguri Junction', 'Amguri', 'Assam', 'NFR', true, 26.8010, 94.6110],
    ['MRHT', 'Moranhat', 'Moranhat', 'Assam', 'NFR', false, 27.1810, 94.6910],
    ['DMR', 'Dharmanagar', 'Dharmanagar', 'Tripura', 'NFR', false, 24.3612, 92.1610], // Tripura borders
    ['ABSA', 'Ambassa', 'Ambassa', 'Tripura', 'NFR', false, 23.9812, 91.8410],
    ['AGTL', 'Agartala', 'Agartala', 'Tripura', 'NFR', true, 23.8340, 91.2828],
    ['UDPU', 'Udaipur', 'Udaipur', 'Tripura', 'NFR', false, 23.5312, 91.4810],
    ['SBRM', 'Sabroom', 'Sabroom', 'Tripura', 'NFR', false, 22.9810, 91.7110],
    ['MANU', 'Manu', 'Manu', 'Tripura', 'NFR', false, 24.0112, 91.9810],
    ['KUGT', 'Kumarghat', 'Kumarghat', 'Tripura', 'NFR', false, 24.1612, 92.0310],
    ['JRN', 'Jirania', 'Jirania', 'Tripura', 'NFR', false, 23.8110, 91.4110],
    ['SKAP', 'Sekerkote', 'Sekerkote', 'Tripura', 'NFR', false, 23.7510, 91.2810],
    ['VBR', 'Bishalgarh', 'Bishalgarh', 'Tripura', 'NFR', false, 23.6912, 91.2610],
    ['MNDP', 'Mendipathar', 'Mendipathar', 'Meghalaya', 'NFR', false, 25.9212, 90.6510], // Meghalaya
    ['JRBM', 'Jiribam', 'Jiribam', 'Manipur', 'NFR', false, 24.7910, 93.1210], // Manipur
    ['BHRB', 'Bairabi', 'Bairabi', 'Mizoram', 'NFR', false, 24.1910, 92.5410], // Mizoram
    ['NHLN', 'Naharlagun', 'Naharlagun', 'Arunachal Pradesh', 'NFR', false, 27.1012, 93.7610], // Arunachal
    ['HMY', 'Harmuti Junction', 'Harmuti', 'Assam', 'NFR', true, 27.0210, 93.8110],
    ['BHAL', 'Bhalukpong', 'Bhalukpong', 'Arunachal Pradesh', 'NFR', false, 27.0112, 92.6410],
    // Bihar (ECR / ER)
    ['PNBE', 'Patna Junction', 'Patna', 'Bihar', 'ECR', true, 25.6022, 85.1194],
    ['DNR', 'Danapur', 'Patna', 'Bihar', 'ECR', true, 25.5912, 85.0410],
    ['ARA', 'Ara Junction', 'Ara', 'Bihar', 'ECR', true, 25.5512, 84.6610],
    ['BXR', 'Buxar', 'Buxar', 'Bihar', 'ECR', false, 25.5712, 83.9710],
    ['RJPB', 'Rajendra Nagar Terminal', 'Patna', 'Bihar', 'ECR', false, 25.5982, 85.1610],
    ['PNC', 'Patna Saheb', 'Patna', 'Bihar', 'ECR', false, 25.5940, 85.2212],
    ['BKP', 'Bakhtiyarpur Junction', 'Bakhtiyarpur', 'Bihar', 'ECR', true, 25.4612, 85.5210],
    ['MKA', 'Mokama Junction', 'Mokama', 'Bihar', 'ECR', true, 25.3912, 85.9010],
    ['BJU', 'Barauni Junction', 'Barauni', 'Bihar', 'ECR', true, 25.4312, 85.9810],
    ['BGS', 'Begusarai', 'Begusarai', 'Bihar', 'ECR', false, 25.4172, 86.1310],
    ['KGG', 'Khagaria Junction', 'Khagaria', 'Bihar', 'ECR', true, 25.5012, 86.4710],
    ['NNA', 'Naugachia', 'Naugachia', 'Bihar', 'ECR', false, 25.3912, 87.1012],
    ['KIR', 'Katihar Junction', 'Katihar', 'Bihar', 'NFR', true, 25.5348, 87.5612],
    ['GAYA', 'Gaya Junction', 'Gaya', 'Bihar', 'ECR', true, 24.7950, 85.0010],
    ['BELA', 'Bela', 'Bela', 'Bihar', 'ECR', false, 25.0310, 84.9910],
    ['JHD', 'Jehanabad', 'Jehanabad', 'Bihar', 'ECR', false, 25.2112, 84.9912],
    ['NWD', 'Nawada', 'Nawada', 'Bihar', 'ECR', false, 24.8812, 85.5410],
    ['KIUL', 'Kiul Junction', 'Kiul', 'Bihar', 'ECR', true, 25.2512, 86.2212],
    ['JAJ', 'Jhajha', 'Jhajha', 'Bihar', 'ECR', true, 24.8912, 86.3812],
    ['JMU', 'Jamui', 'Jamui', 'Bihar', 'ECR', false, 24.9112, 86.2210],
    ['LKR', 'Lakhisarai Junction', 'Lakhisarai', 'Bihar', 'ECR', true, 25.2612, 86.1012],
    ['BGP', 'Bhagalpur Junction', 'Bhagalpur', 'Bihar', 'ER', true, 25.2440, 87.0012],
    ['SGG', 'Sultanganj', 'Sultanganj', 'Bihar', 'ER', false, 25.2410, 86.7410],
    ['JMP', 'Jamalpur Junction', 'Jamalpur', 'Bihar', 'ER', true, 25.3012, 86.5012],
    ['BUA', 'Barhiya', 'Barhiya', 'Bihar', 'ECR', false, 25.2810, 86.0210],
    ['HTZ', 'Hathidah Junction', 'Hathidah', 'Bihar', 'ECR', true, 25.3612, 85.9610],
    ['SHC', 'Saharsa Junction', 'Saharsa', 'Bihar', 'ECR', true, 25.8810, 86.6010],
    ['SBV', 'Simri Bakhtiyarpur', 'Bakhtiyarpur', 'Bihar', 'ECR', false, 25.7510, 86.6210],
    ['COP', 'Copar', 'Copar', 'Bihar', 'ECR', false, 25.6812, 86.5910],
    ['DMH', 'Dauram Madhepura', 'Madhepura', 'Bihar', 'ECR', false, 25.9010, 86.7910],
    ['MNE', 'Mansi Junction', 'Mansi', 'Bihar', 'ECR', true, 25.4812, 86.5910],
    ['THB', 'Thana Bihpur Junction', 'Bihpur', 'Bihar', 'ECR', true, 25.4312, 86.9010],
    ['SMO', 'Semapur', 'Semapur', 'Bihar', 'NFR', false, 25.4610, 87.4210],
    ['SRI', 'Salmari', 'Salmari', 'Bihar', 'NFR', false, 25.6512, 87.7910],
    ['AZR', 'Azamnagar Road', 'Azamnagar', 'Bihar', 'NFR', false, 25.6912, 87.8910],
    ['DNR_T', 'Danapur Town', 'Danapur', 'Bihar', 'ECR', false, 25.6010, 85.0210],
    ['KGG_T', 'Khagaria Town', 'Khagaria', 'Bihar', 'ECR', false, 25.5110, 86.4610],
    ['BJU_T', 'Barauni Town', 'Barauni', 'Bihar', 'ECR', false, 25.4410, 85.9610],
    ['PNC_T', 'Patna Saheb Town', 'Patna', 'Bihar', 'ECR', false, 25.5840, 85.2410],
    ['KIUL_T', 'Kiul Town', 'Kiul', 'Bihar', 'ECR', false, 25.2610, 86.2010],
    ['JAJ_T', 'Jhajha Town', 'Jhajha', 'Bihar', 'ECR', false, 24.9010, 86.3610],
    ['BGP_T', 'Bhagalpur Town', 'Bhagalpur', 'Bihar', 'ER', false, 25.2510, 86.9810],
    // Jharkhand (SER / ECR / ER)
    ['RNC', 'Ranchi Junction', 'Ranchi', 'Jharkhand', 'SER', true, 23.3421, 85.3097],
    ['HTE', 'Hatia', 'Ranchi', 'Jharkhand', 'SER', false, 23.3082, 85.2917],
    ['MURI', 'Muri Junction', 'Muri', 'Jharkhand', 'SER', true, 23.3712, 85.8612],
    ['BKSC', 'Bokaro Steel City', 'Bokaro', 'Jharkhand', 'SER', false, 23.6412, 86.1510],
    ['CRP', 'Chandrapura Junction', 'Chandrapura', 'Jharkhand', 'ECR', true, 23.7512, 86.2210],
    ['GMO', 'Netaji SC Bose Gomoh Junction', 'Gomoh', 'Jharkhand', 'ECR', true, 23.8682, 86.1310],
    ['DHN', 'Dhanbad Junction', 'Dhanbad', 'Jharkhand', 'ECR', true, 23.8012, 86.4312],
    ['MDP', 'Madhupur Junction', 'Madhupur', 'Jharkhand', 'ER', true, 24.2512, 86.6410],
    ['JSME', 'Jasidih Junction', 'Deoghar', 'Jharkhand', 'ER', true, 24.5112, 86.6412],
    ['KQR', 'Koderma Junction', 'Koderma', 'Jharkhand', 'ECR', true, 24.4682, 85.6010],
    ['HZIB', 'Hazaribagh Town', 'Hazaribagh', 'Jharkhand', 'ECR', false, 23.9912, 85.3612],
    ['BRKA', 'Barkakana Junction', 'Barkakana', 'Jharkhand', 'ECR', true, 23.6212, 85.4710],
    ['DTO', 'Daltonganj', 'Daltonganj', 'Jharkhand', 'ECR', false, 24.0312, 84.0710],
    ['LTHR', 'Latehar', 'Latehar', 'Jharkhand', 'ECR', false, 23.7410, 84.5010],
    ['TORI', 'Tori Junction', 'Tori', 'Jharkhand', 'ECR', true, 23.6812, 84.7810],
    ['RHE', 'Rahe', 'Rahe', 'Jharkhand', 'SER', false, 23.3210, 85.7410],
    ['SILLI', 'Silli', 'Silli', 'Jharkhand', 'SER', false, 23.3512, 85.8110],
    ['MHQ', 'Mahuda Junction', 'Mahuda', 'Jharkhand', 'SER', true, 23.7412, 86.2010],
    ['KTH', 'Katrasgarh', 'Katrasgarh', 'Jharkhand', 'ECR', false, 23.8010, 86.2810],
    ['PKA', 'Putki', 'Dhanbad', 'Jharkhand', 'ECR', false, 23.7810, 86.3610],
    ['VAA', 'Bhaga Junction', 'Bhaga', 'Jharkhand', 'SER', true, 23.6810, 86.3910],
    ['JMT', 'Jamtara', 'Jamtara', 'Jharkhand', 'ER', false, 24.0812, 86.8010],
    ['CRJ', 'Chittaranjan', 'Mihijam', 'Jharkhand', 'ER', false, 24.0112, 86.9010],
    ['BRKA_T', 'Barkakana Town', 'Barkakana', 'Jharkhand', 'ECR', false, 23.6110, 85.4510],
    ['RNC_T', 'Ranchi Town', 'Ranchi', 'Jharkhand', 'SER', false, 23.3321, 85.2897],
    ['DHN_T', 'Dhanbad Town', 'Dhanbad', 'Jharkhand', 'ECR', false, 23.8112, 86.4112],
    ['MURI_T', 'Muri Town', 'Muri', 'Jharkhand', 'SER', false, 23.3612, 85.8412],
    ['JSME_T', 'Jasidih Town', 'Deoghar', 'Jharkhand', 'ER', false, 24.5012, 86.6212],
    // Odisha (ECoR / SER)
    ['BBS', 'Bhubaneswar', 'Bhubaneswar', 'Odisha', 'ECoR', true, 20.2524, 85.8449],
    ['CTC', 'Cuttack Junction', 'Cuttack', 'Odisha', 'ECoR', true, 20.4618, 85.8840],
    ['JJKR', 'Jajpur Keonjhar Road', 'Jajpur', 'Odisha', 'ECoR', false, 20.9510, 86.1310],
    ['BHC', 'Bhadrak', 'Bhadrak', 'Odisha', 'ECoR', false, 21.0512, 86.5110],
    ['BLS', 'Balasore', 'Balasore', 'Odisha', 'SER', false, 21.4912, 86.9312],
    ['ROU', 'Rourkela Junction', 'Rourkela', 'Odisha', 'SER', true, 22.2212, 84.8710],
    ['JSG', 'Jharsuguda Junction', 'Jharsuguda', 'Odisha', 'SER', true, 21.8512, 84.0210],
    ['SBP', 'Sambalpur Junction', 'Sambalpur', 'Odisha', 'ECoR', true, 21.4612, 83.9710],
    ['ANGL', 'Angul', 'Angul', 'Odisha', 'ECoR', false, 20.8412, 85.1210],
    ['TLHR', 'Talcher', 'Talcher', 'Odisha', 'ECoR', false, 20.9212, 85.2210],
    ['DNKL', 'Dhenkanal', 'Dhenkanal', 'Odisha', 'ECoR', false, 20.6512, 85.6010],
    ['KUR', 'Khurda Road Junction', 'Jatni', 'Odisha', 'ECoR', true, 20.1512, 85.7010],
    ['PURI', 'Puri', 'Puri', 'Odisha', 'ECoR', false, 19.8118, 85.8110],
    ['BAM', 'Berhampur', 'Brahmapur', 'Odisha', 'ECoR', false, 19.3112, 84.7910],
    ['PSA', 'Palasa', 'Palasa', 'Andhra Pradesh', 'ECoR', false, 18.7712, 84.4110], // Border station close to Odisha
    ['BALU', 'Balugaon', 'Balugaon', 'Odisha', 'ECoR', false, 19.7410, 85.2110],
    ['CAP', 'Chatrapur', 'Chatrapur', 'Odisha', 'ECoR', false, 19.3512, 84.9010],
    ['RAIR', 'Rairakhol', 'Rairakhol', 'Odisha', 'ECoR', false, 21.0612, 84.3410],
    ['BRGA', 'Bargarh Road', 'Bargarh', 'Odisha', 'ECoR', false, 21.3312, 83.6210],
    ['BLGR', 'Balangir', 'Balangir', 'Odisha', 'ECoR', false, 20.7212, 83.4810],
    ['TIG', 'Titlagarh Junction', 'Titlagarh', 'Odisha', 'ECoR', true, 20.2812, 83.1410],
    ['KBJ', 'Kantabanji', 'Kantabanji', 'Odisha', 'ECoR', false, 20.4812, 82.6810],
    ['KSNG', 'Kesinga', 'Kesinga', 'Odisha', 'ECoR', false, 20.2012, 83.2210],
    ['MNGD', 'Muniguda', 'Muniguda', 'Odisha', 'ECoR', false, 19.6310, 83.4910],
    ['RGDA', 'Rayagada', 'Rayagada', 'Odisha', 'ECoR', false, 19.1712, 83.4210],
    ['JKP', 'Jakhapura Junction', 'Jakhapura', 'Odisha', 'ECoR', true, 20.9610, 86.1010],
    ['SKND', 'Sukinda Road', 'Sukinda', 'Odisha', 'ECoR', false, 20.9810, 86.2010],
    ['HCNR', 'Harichandanpur', 'Harichandanpur', 'Odisha', 'ECoR', false, 21.3412, 85.7910],
    ['KDJR', 'Kendujhargarh', 'Kendujhar', 'Odisha', 'ECoR', false, 21.6412, 85.6010],
    ['VSKP', 'Visakhapatnam Junction', 'Visakhapatnam', 'Andhra Pradesh', 'ECoR', true, 17.7212, 83.2810],
    ['VZM', 'Vizianagaram Junction', 'Vizianagaram', 'Andhra Pradesh', 'ECoR', true, 18.1212, 83.4010],
    ['BBS_T', 'Bhubaneswar Town', 'Bhubaneswar', 'Odisha', 'ECoR', false, 20.2624, 85.8249],
    ['CTC_T', 'Cuttack Town', 'Cuttack', 'Odisha', 'ECoR', false, 20.4718, 85.8640],
    ['ROU_T', 'Rourkela Town', 'Rourkela', 'Odisha', 'SER', false, 22.2312, 84.8510],
    ['JSG_T', 'Jharsuguda Town', 'Jharsuguda', 'Odisha', 'SER', false, 21.8612, 84.0010],
    ['SBP_T', 'Sambalpur Town', 'Sambalpur', 'Odisha', 'ECoR', false, 21.4712, 83.9510],
    // Extra generic stations to reach ~300
    // Generated systematically to flesh out local branch loops
    ['EX-WB1', 'Chandrakona Halt', 'Chandrakona', 'West Bengal', 'SER', false, 22.7510, 87.3510],
    ['EX-WB2', 'Salboni Halt', 'Salboni', 'West Bengal', 'SER', false, 22.6510, 87.3010],
    ['EX-WB3', 'Garhbeta Road', 'Garhbeta', 'West Bengal', 'SER', false, 22.8812, 87.3610],
    ['EX-WB4', 'Rampurhat Halt', 'Rampurhat', 'West Bengal', 'ER', false, 24.1810, 87.7910],
    ['EX-WB5', 'Nalhati Halt', 'Nalhati', 'West Bengal', 'ER', false, 24.3110, 87.8510],
    ['EX-WB6', 'Bolpur Town', 'Bolpur', 'West Bengal', 'ER', false, 23.6810, 87.7110],
    ['EX-WB7', 'Katwa Town', 'Katwa', 'West Bengal', 'ER', false, 23.6610, 88.1510],
    ['EX-WB8', 'Ranaghat Town', 'Ranaghat', 'West Bengal', 'ER', false, 23.1910, 88.5810],
    ['EX-WB9', 'Bongaon Town', 'Bongaon', 'West Bengal', 'ER', false, 23.0610, 88.8410],
    ['EX-WB10', 'Bandel Town', 'Bandel', 'West Bengal', 'ER', false, 22.9410, 88.3910],
    ['EX-BH1', 'Jehanabad Town', 'Jehanabad', 'Bihar', 'ECR', false, 25.2310, 85.0110],
    ['EX-BH2', 'Taregna Halt', 'Taregna', 'Bihar', 'ECR', false, 25.3210, 85.0310],
    ['EX-BH3', 'Mokama Halt', 'Mokama', 'Bihar', 'ECR', false, 25.4110, 85.9210],
    ['EX-BH4', 'Begusarai Town', 'Begusarai', 'Bihar', 'ECR', false, 25.4310, 86.1510],
    ['EX-BH5', 'Khagaria Halt', 'Khagaria', 'Bihar', 'ECR', false, 25.5210, 86.4910],
    ['EX-BH6', 'Buxar Town', 'Buxar', 'Bihar', 'ECR', false, 25.5910, 83.9910],
    ['EX-BH7', 'Ara Town', 'Ara', 'Bihar', 'ECR', false, 25.5710, 84.6810],
    ['EX-BH8', 'Nawada Halt', 'Nawada', 'Bihar', 'ECR', false, 24.9010, 85.5610],
    ['EX-BH9', 'Jamui Town', 'Jamui', 'Bihar', 'ECR', false, 24.9310, 86.2410],
    ['EX-BH10', 'Lakhisarai Town', 'Lakhisarai', 'Bihar', 'ECR', false, 25.2810, 86.1210],
    ['EX-AS1', 'Hojai Town', 'Hojai', 'Assam', 'NFR', false, 26.0210, 92.8710],
    ['EX-AS2', 'Lanka Town', 'Lanka', 'Assam', 'NFR', false, 25.9410, 93.0210],
    ['EX-AS3', 'Diphu Town', 'Diphu', 'Assam', 'NFR', false, 25.8610, 93.4410],
    ['EX-AS4', 'Mariani Town', 'Jorhat', 'Assam', 'NFR', false, 26.6810, 94.3410],
    ['EX-AS5', 'Amguri Town', 'Amguri', 'Assam', 'NFR', false, 26.8210, 94.6310],
    ['EX-AS6', 'Simaluguri Town', 'Simaluguri', 'Assam', 'NFR', false, 26.9110, 94.8310],
    ['EX-AS7', 'Dibrugarh Bypass', 'Dibrugarh', 'Assam', 'NFR', false, 27.4610, 94.9310],
    ['EX-AS8', 'Tinsukia Town', 'Tinsukia', 'Assam', 'NFR', false, 27.5210, 95.3810],
    ['EX-AS9', 'Badarpur Town', 'Badarpur', 'Assam', 'NFR', false, 24.9210, 92.6410],
    ['EX-AS10', 'Karimganj Town', 'Karimganj', 'Assam', 'NFR', false, 24.8810, 92.3710],
    ['EX-OD1', 'Jajpur Town', 'Jajpur', 'Odisha', 'ECoR', false, 20.9710, 86.1510],
    ['EX-OD2', 'Bhadrak Halt', 'Bhadrak', 'Odisha', 'ECoR', false, 21.0710, 86.5310],
    ['EX-OD3', 'Balasore Town', 'Balasore', 'Odisha', 'SER', false, 21.5110, 86.9510],
    ['EX-OD4', 'Angul Town', 'Angul', 'Odisha', 'ECoR', false, 20.8610, 85.1410],
    ['EX-OD5', 'Dhenkanal Town', 'Dhenkanal', 'Odisha', 'ECoR', false, 20.6710, 85.6210],
    ['EX-OD6', 'Sambalpur Halt', 'Sambalpur', 'Odisha', 'ECoR', false, 21.4810, 83.9910],
    ['EX-OD7', 'Bargarh Town', 'Bargarh', 'Odisha', 'ECoR', false, 21.3510, 83.6410],
    ['EX-OD8', 'Balangir Town', 'Balangir', 'Odisha', 'ECoR', false, 20.7410, 83.5010],
    ['EX-OD9', 'Titlagarh Halt', 'Titlagarh', 'Odisha', 'ECoR', false, 20.3010, 83.1610],
    ['EX-OD10', 'Rayagada Town', 'Rayagada', 'Odisha', 'ECoR', false, 19.1910, 83.4410],
    ['EX-JH1', 'Muri Halt', 'Muri', 'Jharkhand', 'SER', false, 23.3810, 85.8810],
    ['EX-JH2', 'Bokaro Town', 'Bokaro', 'Jharkhand', 'SER', false, 23.6610, 86.1710],
    ['EX-JH3', 'Gomoh Town', 'Gomoh', 'Jharkhand', 'ECR', false, 23.8810, 86.1510],
    ['EX-JH4', 'Koderma Town', 'Koderma', 'Jharkhand', 'ECR', false, 24.4810, 85.6210],
    ['EX-JH5', 'Latehar Town', 'Latehar', 'Jharkhand', 'ECR', false, 23.7610, 84.5210],
    ['EX-JH6', 'Tori Town', 'Tori', 'Jharkhand', 'ECR', false, 23.7010, 84.8010],
    ['EX-JH7', 'Barkakana Halt', 'Barkakana', 'Jharkhand', 'ECR', false, 23.6310, 85.4910],
    ['EX-JH8', 'Daltonganj Town', 'Daltonganj', 'Jharkhand', 'ECR', false, 24.0510, 84.0910],
    ['EX-JH9', 'Madhupur Town', 'Madhupur', 'Jharkhand', 'ER', false, 24.2710, 86.6610],
    ['EX-JH10', 'Jasidih Halt', 'Deoghar', 'Jharkhand', 'ER', false, 24.5310, 86.6610]
];
// Map raw stations to objects
const STATIONS = STATIONS_RAW.map(([code, name, city, state, zone, isJunction, lat, lon]) => ({
    stationCode: code,
    stationName: name,
    city,
    state,
    zone,
    isJunction,
    latitude: lat,
    longitude: lon,
}));
// Build helper map for quick code checks
const STATIONS_MAP = new Map();
for (const s of STATIONS) {
    STATIONS_MAP.set(s.stationCode, s);
}
// 2. DEFINE REALISTIC CONNECTED CORRIDORS
// Paths must overlap to generate transfer opportunities
const CORRIDORS = [
    // 1) East Coast Corridor: Howrah to Visakhapatnam
    ['HWH', 'LLH', 'RIS', 'SRP', 'CGR', 'CNS', 'BDC', 'KGP', 'EX-OD3', 'BLS', 'EX-OD2', 'BHC', 'JJKR', 'EX-OD1', 'CTC', 'BBS', 'KUR', 'BALU', 'CAP', 'BAM', 'PSA', 'VZM', 'VSKP'],
    // 2) Main Line Trunk North: Howrah to Guwahati via Malda Town
    ['HWH', 'BWN', 'BHP', 'EX-WB6', 'RPH', 'EX-WB4', 'NHT', 'EX-WB5', 'MLDT', 'SM', 'BOE', 'KNE', 'AUB', 'TKG', 'NJP', 'JPE', 'DQG', 'FLK', 'NCB', 'NOQ', 'KOJ', 'NBQ', 'BPRD', 'RNY', 'KYQ', 'GHY'],
    // 3) Gangetic Trunk Main: Howrah to Patna
    ['HWH', 'BWN', 'PAN', 'DGR', 'RNG', 'ASN', 'SIT', 'SLS', 'BRR', 'CRJ', 'JMT', 'MDP', 'EX-JH9', 'JSME', 'EX-JH10', 'JAJ', 'EX-BH9', 'JMU', 'KIUL', 'LKR', 'EX-BH10', 'BUA', 'HTZ', 'MKA', 'EX-BH3', 'BKP', 'PNC', 'RJPB', 'PNBE'],
    // 4) Ganga-Brahmaputra Link: Patna to Guwahati via Katihar
    ['PNBE', 'RJPB', 'PNC', 'BKP', 'MKA', 'BJU', 'BGS', 'EX-BH4', 'KGG', 'EX-BH5', 'MNE', 'THB', 'NNA', 'KIR', 'SMO', 'SRI', 'BOE', 'KNE', 'NJP', 'JPE', 'NCB', 'NBQ', 'GLPT', 'AYU', 'KYQ', 'GHY'],
    // 5) Surma Valley Link: Guwahati to Silchar
    ['GHY', 'JID', 'CPK', 'HJI', 'EX-AS1', 'LKA', 'EX-AS2', 'LMG', 'EX-AS3', 'DPU', 'DMV', 'MBG', 'NHLG', 'EX-AS9', 'BPB', 'KTX', 'SCA', 'SCL'],
    // 6) Upper Assam Trunk: Guwahati to Tinsukia / Ledo
    ['GHY', 'JID', 'HJI', 'LMG', 'DPU', 'DMV', 'FKG', 'MXN', 'EX-AS4', 'AGI', 'EX-AS5', 'SLGR', 'EX-AS6', 'MRHT', 'LHB', 'DBRG', 'DBRT', 'NTS', 'TSK', 'LEDO', 'DNT'],
    // 7) Tripura Border Link: Silchar to Sabroom / Agartala
    ['SCL', 'KTX', 'HKD', 'BPB', 'EX-AS10', 'KXJ', 'DMR', 'KUGT', 'MANU', 'ABSA', 'JRN', 'AGTL', 'SKAP', 'VBR', 'UDPU', 'SBRM'],
    // 8) Ranchi Loop: Ranchi to Patna
    ['RNC', 'HTE', 'MURI', 'EX-JH1', 'SILLI', 'BKSC', 'EX-JH2', 'CRP', 'MHQ', 'KTH', 'PKA', 'GMO', 'EX-JH3', 'KQR', 'EX-JH4', 'GAYA', 'EX-BH8', 'NWD', 'BELA', 'JHD', 'EX-BH1', 'EX-BH2', 'PNBE'],
    // 9) Coal Belt Loop: Ranchi to Howrah
    ['RNC', 'HTE', 'MURI', 'SILLI', 'RHE', 'VAA', 'ADRA', 'BQA', 'VSU', 'GBA', 'CDGR', 'SLB', 'EX-WB3', 'EX-WB2', 'MIG', 'MDN', 'KGP', 'SRC', 'SHM', 'HWH'],
    // 10) Odisha Inland Loop: Bhubaneswar to Rourkela
    ['BBS', 'CTC', 'DNKL', 'EX-OD5', 'TLHR', 'ANGL', 'EX-OD4', 'RAIR', 'SBP', 'EX-OD6', 'BRGA', 'EX-OD7', 'BLGR', 'EX-OD8', 'TIG', 'EX-OD9', 'KBJ', 'KSNG', 'MNGD', 'RGDA', 'EX-OD10', 'JSG', 'ROU'],
    // 11) Hill Top Link: Guwahati to Naharlagun / Arunachal
    ['GHY', 'KYQ', 'RNY', 'TNL', 'ULG', 'RPAN', 'DKGN', 'GPZ', 'VNE', 'HMY', 'NHLN', 'BHAL'],
    // 12) West-East Link: Katihar to Siliguri (Mahananda valley)
    ['KIR', 'SRI', 'BOE', 'DDL', 'KNE', 'AUB', 'TKG', 'SGUJ', 'NJP']
];
// Helper to filter valid stations within corridors (safety fallback)
const cleanCorridors = CORRIDORS.map(corridor => {
    return corridor.filter(code => {
        const exists = STATIONS_MAP.has(code);
        if (!exists) {
            console.warn(`[Warning] Station code ${code} defined in corridor, but missing from dictionary. Filtering out.`);
        }
        return exists;
    });
});
// Calculate distance using Haversine formula (km)
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    // Return rounded distance, incorporating a 1.15 track routing curvature factor
    return Math.round(d * 1.15 * 10) / 10;
}
// 3. GENERATE TRAINS AND TIMETABLES
const trainTypes = [
    { type: 'Passenger', speed: 48, layover: 2, prob: 1.0, delayAvg: 45, delayStd: 25, cancelProb: 0.02 },
    { type: 'Express', speed: 68, layover: 3, prob: 0.6, delayAvg: 25, delayStd: 15, cancelProb: 0.01 },
    { type: 'Superfast', speed: 88, layover: 4, prob: 0.35, delayAvg: 15, delayStd: 10, cancelProb: 0.005 },
    { type: 'Rajdhani', speed: 108, layover: 8, prob: 0.12, delayAvg: 8, delayStd: 6, cancelProb: 0.002 },
    { type: 'Shatabdi', speed: 102, layover: 6, prob: 0.15, delayAvg: 10, delayStd: 7, cancelProb: 0.003 },
    { type: 'Vande Bharat', speed: 112, layover: 5, prob: 0.12, delayAvg: 6, delayStd: 5, cancelProb: 0.002 },
];
const WEEK_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const generatedTrains = [];
const generatedStops = [];
let trainCounter = 12001; // Start train numbers sequentially (common Indian Railways bracket)
// Generate trains running back and forth along defined corridors
// To reach 900–1200 trains, we will create multiple runs per corridor per day at offset intervals
const runsPerCorridor = 45; // 45 UP + 45 DOWN runs across 12 corridors = ~1080 trains total
for (let cIdx = 0; cIdx < cleanCorridors.length; cIdx++) {
    const corridor = cleanCorridors[cIdx];
    if (corridor.length < 5)
        continue; // Skip short corridors
    for (let run = 0; run < runsPerCorridor; run++) {
        // Generate both UP and DOWN directions
        for (const direction of ['UP', 'DOWN']) {
            const path = direction === 'UP' ? [...corridor] : [...corridor].reverse();
            // Determine train type based on a pseudo-random rotation to balance distribution
            const typeObj = trainTypes[(run + (direction === 'UP' ? 0 : 1)) % trainTypes.length];
            // Select stop sequence based on train type
            const stopsSelected = [];
            // Force include first and last stations
            stopsSelected.push(path[0]);
            for (let i = 1; i < path.length - 1; i++) {
                const s = STATIONS_MAP.get(path[i]);
                if (s.isJunction) {
                    // Junctions are always stopped at
                    stopsSelected.push(path[i]);
                }
                else {
                    // Intermediate stations depend on type probability
                    if (Math.random() < typeObj.prob) {
                        stopsSelected.push(path[i]);
                    }
                }
            }
            stopsSelected.push(path[path.length - 1]);
            // Enforce the stop number boundaries constraint [12 to 25 stops]
            let finalStops = stopsSelected;
            if (finalStops.length < 12 && path.length >= 12) {
                // Not enough stops, add additional intermediate stops
                const missing = 12 - finalStops.length;
                const currentSet = new Set(finalStops);
                let added = 0;
                for (let i = 0; i < path.length && added < missing; i++) {
                    if (!currentSet.has(path[i])) {
                        finalStops.push(path[i]);
                        added++;
                    }
                }
                // Re-sort stops in path order
                finalStops = path.filter(code => finalStops.includes(code));
            }
            else if (finalStops.length > 25) {
                // Too many stops, trim intermediate non-junctions
                const intermediates = finalStops.slice(1, finalStops.length - 1);
                // Retain junctions first, then fill up to 23 with others
                const junctions = intermediates.filter(code => STATIONS_MAP.get(code).isJunction);
                const nonJunctions = intermediates.filter(code => !STATIONS_MAP.get(code).isJunction);
                const filledIntermediates = [...junctions];
                let idx = 0;
                while (filledIntermediates.length < 23 && idx < nonJunctions.length) {
                    filledIntermediates.push(nonJunctions[idx]);
                    idx++;
                }
                // Re-sort
                const sortedIntermediates = path.filter(code => filledIntermediates.includes(code));
                finalStops = [finalStops[0], ...sortedIntermediates, finalStops[finalStops.length - 1]];
            }
            // Double check finalStops bounds (e.g. if corridor itself is short)
            if (finalStops.length < 3)
                continue;
            const sourceCode = finalStops[0];
            const destCode = finalStops[finalStops.length - 1];
            const sourceStation = STATIONS_MAP.get(sourceCode);
            const destStation = STATIONS_MAP.get(destCode);
            const trainNumber = (trainCounter++).toString();
            // Create a realistic train name: e.g. "Howrah - Guwahati Vande Bharat Express"
            const originCity = sourceStation.city;
            const destCity = destStation.city;
            const trainName = `${originCity} - ${destCity} ${typeObj.type} ${run % 2 === 0 ? 'Express' : 'Special'}`;
            // Distribute operating days (some daily, some weekly/biweekly)
            let operatingDays = [];
            const randDayMode = run % 4;
            if (randDayMode === 0) {
                operatingDays = [...WEEK_DAYS]; // Daily
            }
            else if (randDayMode === 1) {
                operatingDays = ['MON', 'WED', 'FRI']; // Tri-weekly
            }
            else if (randDayMode === 2) {
                operatingDays = ['TUE', 'THU', 'SAT']; // Tri-weekly alt
            }
            else {
                operatingDays = [WEEK_DAYS[run % 7]]; // Weekly
            }
            // Add train entry
            generatedTrains.push({
                trainNumber,
                trainName,
                trainType: typeObj.type,
                operatingDays,
                sourceStation: sourceCode,
                destinationStation: destCode,
                averageDelayMinutes: Math.round((typeObj.delayAvg + (run % 7)) * 10) / 10,
                delayStandardDeviation: Math.round((typeObj.delayStd + (run % 3)) * 10) / 10,
                cancellationProbability: typeObj.cancelProb,
            });
            // 4. GENERATE INDIVIDUAL STOP SCHEDULES
            // Starting hour spread throughout the day
            let currentHour = (6 + run * 3) % 24;
            let currentMinute = (run * 11) % 60;
            let dayOffset = 0;
            let cumulativeDistance = 0.0;
            for (let i = 0; i < finalStops.length; i++) {
                const currentStopCode = finalStops[i];
                const currentStopStation = STATIONS_MAP.get(currentStopCode);
                let arrivalTime = '';
                let departureTime = '';
                let travelMinutes = 0;
                if (i === 0) {
                    // Origin station
                    arrivalTime = 'Source';
                    departureTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
                }
                else {
                    // Intermediary / Terminal station
                    const prevStopCode = finalStops[i - 1];
                    const prevStopStation = STATIONS_MAP.get(prevStopCode);
                    const distanceDiff = calculateHaversineDistance(prevStopStation.latitude, prevStopStation.longitude, currentStopStation.latitude, currentStopStation.longitude);
                    cumulativeDistance += distanceDiff;
                    // Calculate travel time based on speed
                    const hoursNeeded = distanceDiff / typeObj.speed;
                    travelMinutes = Math.round(hoursNeeded * 60);
                    if (travelMinutes < 10)
                        travelMinutes = 10; // Enforce minimum distance travel time
                    // Add to time clock
                    currentMinute += travelMinutes;
                    while (currentMinute >= 60) {
                        currentMinute -= 60;
                        currentHour += 1;
                        if (currentHour >= 24) {
                            currentHour -= 24;
                            dayOffset += 1;
                        }
                    }
                    arrivalTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
                    if (i === finalStops.length - 1) {
                        // Terminal station
                        departureTime = 'Destination';
                    }
                    else {
                        // Intermediate layover
                        currentMinute += typeObj.layover;
                        while (currentMinute >= 60) {
                            currentMinute -= 60;
                            currentHour += 1;
                            if (currentHour >= 24) {
                                currentHour -= 24;
                                dayOffset += 1;
                            }
                        }
                        departureTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
                    }
                }
                generatedStops.push({
                    trainId: trainNumber,
                    stationId: currentStopCode,
                    stopNumber: i + 1,
                    arrivalTime,
                    departureTime,
                    dayOffset,
                    distanceFromSource: Math.round(cumulativeDistance * 10) / 10,
                    platform: (1 + ((i + run) % 6)).toString(), // Platform 1 to 6
                    travelMinutesFromPrevious: travelMinutes,
                });
            }
        }
    }
}
// 5. EXPORT TO JSON FILES
// Ensure output path exists
const OUTPUT_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
fs.writeFileSync(path.join(OUTPUT_DIR, 'stations.json'), JSON.stringify(STATIONS, null, 2), 'utf-8');
fs.writeFileSync(path.join(OUTPUT_DIR, 'trains.json'), JSON.stringify(generatedTrains, null, 2), 'utf-8');
fs.writeFileSync(path.join(OUTPUT_DIR, 'trainStops.json'), JSON.stringify(generatedStops, null, 2), 'utf-8');
console.log('==================================================');
console.log('Railway Network Dataset Generation Complete!');
console.log('==================================================');
console.log(`Generated Stations   : ${STATIONS.length}`);
console.log(`Generated Trains     : ${generatedTrains.length}`);
console.log(`Generated TrainStops : ${generatedStops.length}`);
console.log(`Saved output files to: ${OUTPUT_DIR}`);
console.log('==================================================');
