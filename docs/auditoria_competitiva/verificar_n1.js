const path=process.argv[2]; const E=require(path+'/app/engine.js'); global.window={}; require(path+'/app/data/power_cache.js'); const C=window.POWER_CACHE;
const D={ waterDeficit: 3, heatDays: 2, frostDays: 2, coverPct: 3, grainHarvests: 2, cropFamilies: 2 };
const CL={ waterDeficit: 3, heatDays: 2, frostDays: 2, coverPct: 0, grainHarvests: 0, cropFamilies: 0 };
for (const k of Object.keys(C.locations)) { const agg=E.fromCompact(C.locations[k].dekads); const a=E.seasonWins(agg,'arcilloso',D), b=E.seasonWins(agg,'arcilloso',CL); console.log(k, 'def', JSON.stringify(a.wins), 'clima', JSON.stringify(b.wins)); }
