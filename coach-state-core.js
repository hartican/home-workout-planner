(function(root, factory){
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CoachStateCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  'use strict';

  const PROFILE_SCHEMA_VERSION = 2;
  const PROFILE_FIELDS = ['name','username','avatar','height','age','sex','weight','fitnessLevel'];

  function isObject(value){
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  function defaultProfile(){
    return {
      name:'',
      username:'',
      avatar:'preset:ocean',
      height:null,
      age:null,
      sex:'',
      weight:null,
      fitnessLevel:''
    };
  }

  function normaliseProfile(value){
    const source = isObject(value) ? value : {};
    const profile = defaultProfile();
    PROFILE_FIELDS.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(source, key)) profile[key] = source[key];
    });
    profile.name = String(profile.name || '').trim();
    profile.username = String(profile.username || '').trim();
    profile.avatar = String(profile.avatar || 'preset:ocean');
    profile.sex = ['female','male','other'].includes(profile.sex) ? profile.sex : '';
    profile.fitnessLevel = ['beginner','intermediate','advanced'].includes(profile.fitnessLevel) ? profile.fitnessLevel : '';
    ['height','age','weight'].forEach(key => {
      const valueAsNumber = Number(profile[key]);
      profile[key] = profile[key] === '' || profile[key] == null || !Number.isFinite(valueAsNumber) || valueAsNumber <= 0
        ? null
        : valueAsNumber;
    });
    return profile;
  }

  function mergeNested(defaultValue, importedValue){
    const merged = {};
    Object.keys(isObject(defaultValue) ? defaultValue : {}).forEach(key => {
      const fallback = defaultValue[key];
      const incoming = isObject(importedValue) ? importedValue[key] : undefined;
      merged[key] = isObject(fallback)
        ? Object.assign({}, fallback, isObject(incoming) ? incoming : {})
        : incoming === undefined ? fallback : incoming;
    });
    return merged;
  }

  function mergeSnapshot(defaults, snapshot){
    const baseline = isObject(defaults) ? defaults : {};
    const source = isObject(snapshot) ? snapshot : {};
    const merged = Object.assign({}, baseline, source);
    merged.profile = normaliseProfile(source.profile);
    merged.profileSchemaVersion = PROFILE_SCHEMA_VERSION;
    merged.settings = Object.assign({}, isObject(baseline.settings) ? baseline.settings : {}, isObject(source.settings) ? source.settings : {});
    merged.lifts = mergeNested(baseline.lifts, source.lifts);
    merged.sessions = Array.isArray(source.sessions) ? source.sessions : (Array.isArray(baseline.sessions) ? baseline.sessions : []);
    return merged;
  }

  function importSnapshot(defaults, payload){
    if (!isObject(payload)) throw new TypeError('Invalid Do Less backup');
    const snapshot = isObject(payload.state) ? payload.state : payload;
    if (!isObject(snapshot) || !Array.isArray(snapshot.sessions) || !isObject(snapshot.lifts)) {
      throw new TypeError('Invalid Do Less backup');
    }
    return mergeSnapshot(defaults, snapshot);
  }

  function resetSnapshot(defaults){
    return mergeSnapshot(defaults, {});
  }

  function profileNeedsRewrite(snapshot){
    const source = isObject(snapshot) ? snapshot : {};
    if (Number(source.profileSchemaVersion) !== PROFILE_SCHEMA_VERSION) return true;
    return JSON.stringify(normaliseProfile(source.profile)) !== JSON.stringify(source.profile);
  }

  return {
    PROFILE_SCHEMA_VERSION,
    defaultProfile,
    normaliseProfile,
    mergeSnapshot,
    importSnapshot,
    resetSnapshot,
    profileNeedsRewrite
  };
});
