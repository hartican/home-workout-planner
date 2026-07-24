(function(root, factory){
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CoachPrescriptionCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  'use strict';

  function round(value, precision){
    const scale = Math.pow(10, precision == null ? 2 : precision);
    return Math.round((Number(value) || 0) * scale) / scale;
  }

  function upperTargetNumber(text){
    const range = String(text || '').match(/(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)/);
    if (range) return Number(range[2]);
    const number = String(text || '').match(/\d+(?:\.\d+)?/);
    return number ? Number(number[0]) : null;
  }

  function create(target, prescribedSec){
    const label = String(target || '').trim();
    const text = label.toLowerCase();
    const supportsSeconds = text.includes('second') || text.includes('minute');
    const supportsReps = !supportsSeconds && !text.includes('+') && (text.includes('rep') || text.includes('per leg') || text.includes('per side'));
    const reps = supportsReps ? upperTargetNumber(text) : null;
    const seconds = supportsSeconds ? Math.max(1, Math.round(Number(prescribedSec) || 0)) : null;
    const loadMatch = text.match(/@\s*(\d+(?:\.\d+)?)\s*kg/);
    const loadKg = loadMatch ? Number(loadMatch[1]) : null;
    return {
      generatedTarget:label,
      perSide:text.includes('per side') || text.includes('per leg'),
      baseReps:reps,
      reps,
      repIncrement:1,
      repIncrease:0,
      baseSeconds:seconds,
      seconds,
      secondsIncrement:seconds != null && seconds >= 60 ? 15 : 5,
      secondsIncrease:0,
      baseLoadKg:loadKg,
      loadKg,
      loadIncrementKg:2.5,
      loadIncreaseKg:0,
      generatedPrescribedSec:Math.max(0, Math.round(Number(prescribedSec) || 0))
    };
  }

  function adjust(value, field, direction){
    const next = Object.assign({}, value);
    const change = direction < 0 ? -1 : 1;
    if (field === 'reps' && next.baseReps != null){
      next.reps = Math.max(next.baseReps, round(Number(next.reps) + change * next.repIncrement));
      next.repIncrease = round(next.reps - next.baseReps);
    }
    if (field === 'seconds' && next.baseSeconds != null){
      next.seconds = Math.max(next.baseSeconds, round(Number(next.seconds) + change * next.secondsIncrement));
      next.secondsIncrease = round(next.seconds - next.baseSeconds);
    }
    if (field === 'load' && next.baseLoadKg != null){
      next.loadKg = Math.max(next.baseLoadKg, round(Number(next.loadKg) + change * next.loadIncrementKg));
      next.loadIncreaseKg = round(next.loadKg - next.baseLoadKg);
    }
    return next;
  }

  function toLog(value){
    return {
      generatedTarget:String(value && value.generatedTarget || ''),
      perSide:!!(value && value.perSide),
      prescribedReps:value && value.baseReps != null ? Number(value.baseReps) : null,
      completedReps:value && value.reps != null ? Number(value.reps) : null,
      prescribedSeconds:value && value.baseSeconds != null ? Number(value.baseSeconds) : null,
      completedSeconds:value && value.seconds != null ? Number(value.seconds) : null,
      prescribedLoadKg:value && value.baseLoadKg != null ? Number(value.baseLoadKg) : null,
      completedLoadKg:value && value.loadKg != null ? Number(value.loadKg) : null,
      repIncrease:Math.max(0, Number(value && value.repIncrease) || 0),
      secondsIncrease:Math.max(0, Number(value && value.secondsIncrease) || 0),
      loadIncreaseKg:Math.max(0, Number(value && value.loadIncreaseKg) || 0)
    };
  }

  function summary(value){
    if (!value) return '';
    const reps = value.completedReps != null ? value.completedReps : value.reps;
    const seconds = value.completedSeconds != null ? value.completedSeconds : value.seconds;
    const load = value.completedLoadKg != null ? value.completedLoadKg : value.loadKg;
    const perSide = !!value.perSide;
    const parts = [];
    if (reps != null) parts.push(Number(reps) + ' reps' + (perSide ? ' / side' : ''));
    else if (seconds != null) parts.push(Number(seconds) + ' sec' + (perSide ? ' / side' : ''));
    if (load != null) parts.push('@ ' + Number(load) + ' kg');
    return parts.join(' ') || String(value.generatedTarget || '');
  }

  function finiteOrNull(value){
    const numeric = Number(value);
    return value == null || value === '' || !Number.isFinite(numeric) ? null : numeric;
  }

  function normaliseLog(exercise){
    const source = exercise && typeof exercise === 'object' ? exercise : {};
    const nested = source.prescription && typeof source.prescription === 'object' ? source.prescription : {};
    const generatedTarget = String(nested.generatedTarget || source.generatedTarget || source.target || '');
    const seed = toLog(create(generatedTarget, source.prescribedSec));
    const prescribedReps = finiteOrNull(nested.prescribedReps != null ? nested.prescribedReps : seed.prescribedReps);
    const prescribedSeconds = finiteOrNull(nested.prescribedSeconds != null ? nested.prescribedSeconds : seed.prescribedSeconds);
    const prescribedLoadKg = finiteOrNull(nested.prescribedLoadKg != null ? nested.prescribedLoadKg : seed.prescribedLoadKg);
    const rawReps = finiteOrNull(nested.completedReps != null ? nested.completedReps : source.reps);
    const rawSeconds = finiteOrNull(nested.completedSeconds != null ? nested.completedSeconds : source.loggedSeconds);
    const rawLoad = finiteOrNull(nested.completedLoadKg != null ? nested.completedLoadKg : source.kg);
    const completedReps = rawReps == null ? prescribedReps : Math.max(prescribedReps == null ? 0 : prescribedReps, rawReps);
    const completedSeconds = rawSeconds == null ? prescribedSeconds : Math.max(prescribedSeconds == null ? 0 : prescribedSeconds, rawSeconds);
    const completedLoadKg = rawLoad == null ? prescribedLoadKg : Math.max(prescribedLoadKg == null ? 0 : prescribedLoadKg, rawLoad);
    return {
      generatedTarget,
      perSide:nested.perSide != null ? !!nested.perSide : seed.perSide,
      prescribedReps,
      completedReps,
      prescribedSeconds,
      completedSeconds,
      prescribedLoadKg,
      completedLoadKg,
      repIncrease:prescribedReps == null || completedReps == null ? 0 : round(Math.max(0, completedReps - prescribedReps)),
      secondsIncrease:prescribedSeconds == null || completedSeconds == null ? 0 : round(Math.max(0, completedSeconds - prescribedSeconds)),
      loadIncreaseKg:prescribedLoadKg == null || completedLoadKg == null ? 0 : round(Math.max(0, completedLoadKg - prescribedLoadKg))
    };
  }

  return {create, adjust, toLog, summary, normaliseLog};
});
