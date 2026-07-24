'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Prescription = require('../coach-prescription-core.js');

test('bodyweight reps move in one-rep steps and never drop below the generated target', () => {
  let value = Prescription.create('12 reps', 48);

  value = Prescription.adjust(value, 'reps', 1);
  assert.equal(value.reps, 13);
  assert.equal(value.repIncrease, 1);

  value = Prescription.adjust(value, 'reps', -1);
  value = Prescription.adjust(value, 'reps', -1);
  assert.equal(value.reps, 12);
  assert.equal(value.repIncrease, 0);
});

test('timed holds use five-second increases and longer timed work uses fifteen seconds', () => {
  const hold = Prescription.adjust(Prescription.create('30 seconds', 30), 'seconds', 1);
  const warmup = Prescription.adjust(Prescription.create('2 minutes', 120), 'seconds', 1);

  assert.equal(hold.seconds, 35);
  assert.equal(hold.secondsIncrease, 5);
  assert.equal(warmup.seconds, 135);
  assert.equal(warmup.secondsIncrease, 15);
  assert.equal(Prescription.adjust(hold, 'seconds', -1).seconds, 30);
});

test('timed per-side targets do not create a second rep control', () => {
  const value = Prescription.create('20–30 seconds per side', 25);

  assert.equal(value.baseReps, null);
  assert.equal(value.baseSeconds, 25);
  assert.equal(value.perSide, true);
});

test('loaded lifts use 2.5 kg increases while reps remain independently adjustable', () => {
  let value = Prescription.create('12 reps @ 12.5 kg', 48);
  value = Prescription.adjust(value, 'load', 1);
  value = Prescription.adjust(value, 'reps', 1);

  assert.equal(value.loadKg, 15);
  assert.equal(value.loadIncreaseKg, 2.5);
  assert.equal(value.reps, 13);

  value = Prescription.adjust(value, 'load', -1);
  value = Prescription.adjust(value, 'load', -1);
  assert.equal(value.loadKg, 12.5);
});

test('completed logs retain both the generated and adjusted prescription', () => {
  let value = Prescription.create('12 reps @ 12.5 kg', 48);
  value = Prescription.adjust(value, 'reps', 1);
  value = Prescription.adjust(value, 'load', 1);
  const log = Prescription.toLog(value);

  assert.deepEqual(log, {
    generatedTarget:'12 reps @ 12.5 kg',
    perSide:false,
    prescribedReps:12,
    completedReps:13,
    prescribedSeconds:null,
    completedSeconds:null,
    prescribedLoadKg:12.5,
    completedLoadKg:15,
    repIncrease:1,
    secondsIncrease:0,
    loadIncreaseKg:2.5
  });
  assert.equal(Prescription.summary(log), '13 reps @ 15 kg');
});

test('legacy completed-exercise fields migrate into the same prescription log shape', () => {
  const migrated = Prescription.normaliseLog({
    target:'12 reps @ 12.5 kg',
    prescribedSec:48,
    reps:14,
    kg:15
  });

  assert.equal(migrated.prescribedReps, 12);
  assert.equal(migrated.completedReps, 14);
  assert.equal(migrated.prescribedLoadKg, 12.5);
  assert.equal(migrated.completedLoadKg, 15);
  assert.equal(migrated.repIncrease, 2);
  assert.equal(migrated.loadIncreaseKg, 2.5);
});
