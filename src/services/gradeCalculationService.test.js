/**
 * Chạy: node src/services/gradeCalculationService.test.js
 */
const {
  computeDiligenceScore,
  computeAcademicScore,
  computeSemesterAverage,
  roundComponentTlGl,
} = require('./gradeCalculationService');

function assertClose(actual, expected, tolerance, label) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${label}: expected ~${expected}, got ${actual}`);
  }
}

// Doc §2.3: 30 mass, 15 catechism, 24/15 present, Đđ=7, 40%
const massPresent = 24;
const catPresent = 15;
const tl = roundComponentTlGl(massPresent * (10 / 30));
const gl = roundComponentTlGl(catPresent * (10 / 15));
assertClose(tl, 7.9, 0.15, 'Tl');
assertClose(gl, 9.9, 0.15, 'Gl');

const diligence = computeDiligenceScore({
  massPresent: 24,
  catechismPresent: 15,
  massRequired: 30,
  catechismRequired: 15,
  ethicsScore: 7,
  disableEthicsScore: false,
  diligencePercentage: 40,
});

assertClose(diligence.dcc, 3.3, 0.15, 'ĐCC');

// Doc §3: ĐHL 4.4 + ĐCC 3.3 = 7.7
const sem = computeSemesterAverage(4.4, diligence.dcc);
assertClose(sem.tbhk, 7.7, 0.15, 'TBHK');

// ĐHL weighted example §1.3
const academic = computeAcademicScore(
  [
    { score_type_id: 'dag', column_count: 1, weight_factor: 1 },
    { score_type_id: '15', column_count: 2, weight_factor: 1 },
    { score_type_id: '45', column_count: 1, weight_factor: 2 },
    { score_type_id: 'thi', column_count: 1, weight_factor: 3 },
  ],
  {
    dag: [10],
    '15': [9, 7],
    '45': [6],
    thi: [7],
  },
  60
);
assertClose(academic.dhl, 4.4, 0.15, 'ĐHL');

console.log('gradeCalculationService.test.js: all assertions passed');
