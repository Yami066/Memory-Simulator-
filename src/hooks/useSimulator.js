import { useReducer, useRef, useCallback } from 'react';
import { runAlgoStep, getApp, APPS } from '../utils/algorithms.js';

/* ═══ Initial State ═══ */
const createInitialState = () => ({
  refString: [],
  appClickCounts: {},
  frames: Array(3).fill(-1),
  frameCount: 3,
  algo: 'FIFO',
  speed: 900,
  running: false,
  paused: false,
  stepIndex: 0,
  faults: 0,
  hits: 0,
  fifoQueue: [],
  lruOrder: [],
  mruOrder: [],
  pageTable: {},       // { pageId: frameIdx }
  simStarted: false,
  loadOrder: Array(3).fill(0),
  loadCounter: 0,
  stepHistory: [],
  eventLog: [],        // [{ msg, type }]
  slotAnims: {},       // { frameIdx: 'hit' | 'fault' }
});

/* ═══ Reducer ═══ */
function reducer(state, action) {
  switch (action.type) {

    case 'ADD_TO_QUEUE': {
      if (state.running) return state;
      const newRef = [...state.refString, action.appId];
      const appClickCounts = {
        ...state.appClickCounts,
        [action.appId]: (state.appClickCounts[action.appId] || 0) + 1,
      };
      return { ...state, refString: newRef, appClickCounts, simStarted: false };
    }

    case 'SET_ALGO':
      return { ...state, algo: action.value };

    case 'SET_SPEED':
      return { ...state, speed: parseInt(action.value) };

    case 'SET_FRAME_COUNT':
      return { ...state, frameCount: Math.max(1, Math.min(6, parseInt(action.value) || 3)) };

    case 'INIT_SIM': {
      const fc = state.frameCount;
      return {
        ...state,
        frames: Array(fc).fill(-1),
        fifoQueue: [],
        lruOrder: [],
        mruOrder: [],
        loadOrder: Array(fc).fill(0),
        loadCounter: 0,
        faults: 0,
        hits: 0,
        stepIndex: 0,
        pageTable: {},
        simStarted: true,
        stepHistory: [],
        eventLog: [],
        slotAnims: {},
      };
    }

    case 'EXECUTE_STEP': {
      const i = state.stepIndex;
      if (i >= state.refString.length) return state;
      const page = state.refString[i];
      const app = getApp(page);
      const name = app ? app.name : 'P' + page;

      // Clone mutable arrays for the algo
      const frames = [...state.frames];
      const fifoQ = [...state.fifoQueue];
      const lruOrd = [...state.lruOrder];
      const mruOrd = [...state.mruOrder];
      const loadOrd = [...state.loadOrder];
      let loadCtr = state.loadCounter;

      const result = runAlgoStep(
        page, i, frames, state.frameCount, state.algo,
        fifoQ, lruOrd, state.refString, loadOrd, loadCtr, mruOrd
      );
      if (result.loadCtr !== undefined) loadCtr = result.loadCtr;

      let faults = state.faults;
      let hits = state.hits;
      const newLog = [...state.eventLog];
      const newAnims = {};

      if (result.hit) {
        hits++;
        newLog.push({ msg: `HIT: ${name} found in F${result.frameIdx}`, type: 'hit' });
        newAnims[result.frameIdx] = 'hit';
      } else {
        faults++;
        const victimApp = result.victim > 0 ? getApp(result.victim) : null;
        const vname = victimApp ? victimApp.name : (result.victim > 0 ? 'P' + result.victim : '—');
        newLog.push({
          msg: `FAULT: ${name} → F${result.frameIdx}` + (result.victim > 0 ? ` (evicted ${vname})` : ''),
          type: 'fault'
        });
        newAnims[result.frameIdx] = 'fault';
      }

      // Keep last 50 logs
      if (newLog.length > 50) newLog.splice(0, newLog.length - 50);

      const newPageTable = { ...state.pageTable };
      newPageTable[page] = result.frameIdx;

      const newHistory = [...state.stepHistory, { step: i + 1, page, frames: [...frames], hit: result.hit }];

      return {
        ...state,
        frames,
        fifoQueue: fifoQ,
        lruOrder: lruOrd,
        mruOrder: mruOrd,
        loadOrder: loadOrd,
        loadCounter: loadCtr,
        faults,
        hits,
        stepIndex: i + 1,
        pageTable: newPageTable,
        stepHistory: newHistory,
        eventLog: newLog,
        slotAnims: newAnims,
        simStarted: (i + 1) < state.refString.length,
      };
    }

    case 'CLEAR_ANIMS':
      return { ...state, slotAnims: {} };

    case 'SET_RUNNING':
      return { ...state, running: action.value };

    case 'SET_PAUSED':
      return { ...state, paused: action.value };

    case 'RESET':
      return createInitialState();

    case 'GENERATE_RANDOM': {
      const len = 10 + Math.floor(Math.random() * 6);
      const arr = [];
      for (let i = 0; i < len; i++) arr.push(1 + Math.floor(Math.random() * 7));
      const fc = state.frameCount;
      return {
        ...createInitialState(),
        refString: arr,
        frameCount: fc,
        frames: Array(fc).fill(-1),
        loadOrder: Array(fc).fill(0),
      };
    }

    default:
      return state;
  }
}

/* ═══ Custom Hook ═══ */
export function useSimulator() {
  const [state, dispatch] = useReducer(reducer, null, createInitialState);

  // Refs for the async run loop
  const runningRef = useRef(false);
  const pausedRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const addToQueue = useCallback((appId) => dispatch({ type: 'ADD_TO_QUEUE', appId }), []);
  const setAlgo = useCallback((value) => dispatch({ type: 'SET_ALGO', value }), []);
  const setSpeed = useCallback((value) => dispatch({ type: 'SET_SPEED', value }), []);
  const setFrameCount = useCallback((value) => dispatch({ type: 'SET_FRAME_COUNT', value }), []);
  const reset = useCallback(() => {
    runningRef.current = false;
    pausedRef.current = false;
    dispatch({ type: 'RESET' });
  }, []);
  const generateRandom = useCallback(() => {
    runningRef.current = false;
    pausedRef.current = false;
    dispatch({ type: 'GENERATE_RANDOM' });
  }, []);

  const stepOnce = useCallback(() => {
    const s = stateRef.current;
    if (!s.simStarted && s.refString.length > 0) {
      dispatch({ type: 'INIT_SIM' });
      // After INIT_SIM, schedule the step
      setTimeout(() => dispatch({ type: 'EXECUTE_STEP' }), 20);
    } else if (s.stepIndex < s.refString.length) {
      dispatch({ type: 'EXECUTE_STEP' });
    }
  }, []);

  const runSimulation = useCallback(async () => {
    const s = stateRef.current;

    // If currently running and not paused → pause
    if (runningRef.current && !pausedRef.current) {
      pausedRef.current = true;
      dispatch({ type: 'SET_PAUSED', value: true });
      return;
    }
    // If currently paused → resume
    if (runningRef.current && pausedRef.current) {
      pausedRef.current = false;
      dispatch({ type: 'SET_PAUSED', value: false });
      return;
    }

    // Start fresh
    if (!s.simStarted && s.refString.length > 0) {
      dispatch({ type: 'INIT_SIM' });
      await new Promise(r => setTimeout(r, 30));
    }

    runningRef.current = true;
    pausedRef.current = false;
    dispatch({ type: 'SET_RUNNING', value: true });
    dispatch({ type: 'SET_PAUSED', value: false });

    const loop = async () => {
      while (runningRef.current) {
        // Wait while paused
        while (pausedRef.current && runningRef.current) {
          await new Promise(r => setTimeout(r, 100));
        }
        if (!runningRef.current) break;

        const current = stateRef.current;
        if (current.stepIndex >= current.refString.length) break;

        dispatch({ type: 'EXECUTE_STEP' });
        await new Promise(r => setTimeout(r, current.speed));
      }

      runningRef.current = false;
      pausedRef.current = false;
      dispatch({ type: 'SET_RUNNING', value: false });
      dispatch({ type: 'SET_PAUSED', value: false });
    };

    loop();
  }, []);

  const clearAnims = useCallback(() => dispatch({ type: 'CLEAR_ANIMS' }), []);

  return {
    state,
    dispatch,
    addToQueue,
    setAlgo,
    setSpeed,
    setFrameCount,
    reset,
    generateRandom,
    stepOnce,
    runSimulation,
    clearAnims,
    runningRef,
  };
}
