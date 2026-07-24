'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const StateCore = require('../coach-state-core.js');

function defaults(){
  return {
    profileSchemaVersion:StateCore.PROFILE_SCHEMA_VERSION,
    profile:StateCore.defaultProfile(),
    settings:{reminderEnabled:true, lastEnvironment:'indoor'},
    lifts:{push:{reps:8}, squat:{reps:12, kg:12.5}},
    sessions:[],
    goal:'abs'
  };
}

test('partial legacy profiles gain new defaults and retired fields stay retired', () => {
  const migrated = StateCore.mergeSnapshot(defaults(), {
    profile:{
      name:'Jack',
      username:'QuietGrit',
      timezone:'Australia/Sydney',
      longitude:151.2
    }
  });

  assert.deepEqual(migrated.profile, {
    name:'Jack',
    username:'QuietGrit',
    avatar:'preset:ocean',
    height:null,
    age:null,
    sex:'',
    weight:null,
    fitnessLevel:''
  });
  assert.equal(migrated.profileSchemaVersion, StateCore.PROFILE_SCHEMA_VERSION);
});

test('backup import accepts the exported wrapper and safely deep-merges nested defaults', () => {
  const imported = StateCore.importSnapshot(defaults(), {
    app:'Do Less',
    state:{
      sessions:[{sessionId:'session-1'}],
      lifts:{squat:{reps:16}},
      settings:{reminderEnabled:false},
      profile:{fitnessLevel:'advanced'}
    }
  });

  assert.deepEqual(imported.lifts, {
    push:{reps:8},
    squat:{reps:16, kg:12.5}
  });
  assert.deepEqual(imported.settings, {
    reminderEnabled:false,
    lastEnvironment:'indoor'
  });
  assert.equal(imported.profile.avatar, 'preset:ocean');
  assert.equal(imported.profile.fitnessLevel, 'advanced');
  assert.deepEqual(imported.sessions, [{sessionId:'session-1'}]);
});

test('reset returns a clean authoritative profile with no values from the previous state', () => {
  const reset = StateCore.resetSnapshot(defaults());

  assert.deepEqual(reset.profile, StateCore.defaultProfile());
  assert.deepEqual(reset.sessions, []);
  assert.equal(reset.goal, 'abs');
  assert.equal(reset.profileSchemaVersion, StateCore.PROFILE_SCHEMA_VERSION);
});

test('profile values survive a JSON save and reload without type drift', () => {
  const saved = StateCore.mergeSnapshot(defaults(), {
    profile:{
      name:' Jack ',
      username:' QuietGrit ',
      avatar:'preset:night',
      height:'181',
      age:'40',
      sex:'male',
      weight:'82.5',
      fitnessLevel:'intermediate'
    }
  });
  const reloaded = StateCore.mergeSnapshot(defaults(), JSON.parse(JSON.stringify(saved)));

  assert.deepEqual(reloaded.profile, {
    name:'Jack',
    username:'QuietGrit',
    avatar:'preset:night',
    height:181,
    age:40,
    sex:'male',
    weight:82.5,
    fitnessLevel:'intermediate'
  });
});

test('legacy or non-canonical profiles request one durable storage rewrite', () => {
  const legacy = {
    profileSchemaVersion:1,
    profile:{name:' Jack ', timezone:'Australia/Sydney'}
  };
  const canonical = {
    profileSchemaVersion:StateCore.PROFILE_SCHEMA_VERSION,
    profile:StateCore.normaliseProfile({name:'Jack'})
  };

  assert.equal(StateCore.profileNeedsRewrite(legacy), true);
  assert.equal(StateCore.profileNeedsRewrite(canonical), false);
});
