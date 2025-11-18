import { clampDate, daysBetween } from './src/utils/dateUtils';

console.log("--- Testing clampDate ---");

const min = '2023-01-05';
const max = '2023-01-15';

const testDate1 = '2023-01-10'; // Inside range
const result1 = clampDate(testDate1, min, max);
console.log(`Input: ${testDate1}, Range: [${min}, ${max}], Expected: ${testDate1}, Got: ${result1}`);

const testDate2 = '2023-01-01'; // Below min
const result2 = clampDate(testDate2, min, max);
console.log(`Input: ${testDate2}, Range: [${min}, ${max}], Expected: ${min}, Got: ${result2}`);

const testDate3 = '2023-01-20'; // Above max
const result3 = clampDate(testDate3, min, max);
console.log(`Input: ${testDate3}, Range: [${min}, ${max}], Expected: ${max}, Got: ${result3}`);
