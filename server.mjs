// BioDeck-MD API: zero-dependency Node server. Run: node server.mjs  (http://localhost:3001/api/v1)
// Every response: { simulated: true, data } or { simulated: true, error: { code, message, details? } }
import http from 'node:http';

const LIMIT = 600, PRIOR = 140;
const ENVS = {
  transit: { id: 'transit', name: 'Deep Space Transit (Orion/Gateway)', mSvPerDay: 0.66, shieldPct: 35, cautionFraction: 0.6 },
  lunar:   { id: 'lunar',   name: 'Lunar Surface Base',               mSvPerDay: 0.34, shieldPct: 60, cautionFraction: 0.65 },
  eva:     { id: 'eva',     name: 'EVA Spacewalk Suit',               mSvPerDay: 1.9,  shieldPct: 8,  cautionFraction: 0.45 },
};
const HAZARDS = [
  { id: 'spe', name: 'Solar Particle Event', kind: 'acute', systems: ['gi', 'marrow'], explain: 'Burst of high-energy protons. Causes nausea, fatigue, skin redness and a short-term immune drop.' },
  { id: 'gcr', name: 'Galactic Cosmic Rays', kind: 'chronic', systems: ['brain', 'eye', 'marrow'], explain: 'Constant heavy ions. Damage DNA, irritate brain tissue and raise cataract risk.' },
  { id: 'sans', name: 'Fluid shift (SANS)', kind: 'chronic', systems: ['eye'], explain: 'Zero gravity moves fluid to the head and can blur near vision.' },
];
const SYSTEMS = { brain: 'Brain & CNS', eye: 'Eyes', marrow: 'Bone Marrow & Immune', gi: 'GI Tract & Skin' };
const CREW = [
  { id: 'a1', name: 'Cmdr. A. Reyes', role: 'Commander' },
  { id: 'a2', name: 'Dr. M. Okafor', role: 'Mission Specialist' },
  { id: 'a3', name: 'Lt. J. Tanaka', role: 'Pilot' },
];
const MODULES = [{ id: 'cockpit', shieldPct: 15 }, { id: 'hab', shieldPct: 45 }, { id: 'cargo', shieldPct: 88 }];

const sim = { day: 14, scenario: 'nominal', flares: [], alerts: [], checkins: [], speUntil: 0 };
const alerts = [];
const LEVELS = ['NOMINAL', 'CAUTION', 'CRITICAL'];

// ---------- helpers ----------
const rnd = (seed) => { let x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); };
const rate = (env) => ENVS[env].mSvPerDay * (sim.scenario === 'ff' ? 1.717 : 1);
const cum = (env, day = sim.day) => PRIOR + rate(env) * day + sim.flares.filter(f => f.day <= day).reduce((a, f) => a + f.mSv, 0);
const speOn = () => Date.now() < sim.speUntil;

function systems(env, crewId) {
  const f = cum(env) / LIMIT, E = ENVS[env];
  const spe = speOn();
  const lv = {
    brain: Math.max(f >= 0.75 ? 1 : 0, sim.scenario === 'ff' ? 1 : 0),
    eye: sim.scenario === 'ff' || f >= 0.65 ? 1 : 0,
    marrow: Math.max(f >= 0.85 ? 2 : f >= E.cautionFraction ? 1 : 0, spe ? 1 : 0),
    gi: spe ? 2 : 0,
  };
  return Object.entries(lv).map(([id, l]) => ({
    id, name: SYSTEMS[id], level: l, status: LEVELS[l],
    drivers: [
      ...(id === 'gi' && spe ? ['Active solar particle event'] : []),
      ...(id === 'marrow' && f >= E.cautionFraction ? [`Career dose ${(f * 100).toFixed(0)}% of limit`] : []),
      ...(['brain', 'eye'].includes(id) && sim.scenario === 'ff' ? ['Long-duration GCR exposure'] : []),
    ],
  }));
}
function series(env, key, from = 0, to = sim.day) {
  const out = [];
  for (let d = from; d <= to; d++) {
    const dose = cum(env, d);
    const map = {
      cumulative_dose: dose,
      heart_rate: 66 + rnd(d) * 8 + (speOn() && d === sim.day ? 12 : 0),
      sleep_hours: 7.4 - (sim.scenario === 'ff' ? 1.6 : 0) + (rnd(d + 7) - 0.5),
      reaction_ms: 290 + (sim.scenario === 'ff' ? 70 : 0) + rnd(d + 3) * 30,
    };
    if (!(key in map)) return null;
    out.push({ day: d, value: +map[key].toFixed(2) });
  }
  return out;
}
const BASELINE = { cumulative_dose: [0, LIMIT], heart_rate: [60, 76], sleep_hours: [6.5, 8.5], reaction_ms: [250, 340] };

// ---------- routing ----------
const routes = [];
const route = (m, p, h) => routes.push({ m, re: new RegExp('^' + p.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), h });
const ok = (data, status = 200) => ({ status, body: { simulated: true, data } });
class ApiError extends Error { constructor(status, code, message, details) { super(message); Object.assign(this, { status, code, details }); } }
const needEnv = (q) => { const e = q.get('env') || 'transit'; if (!ENVS[e]) throw new ApiError(400, 'invalid_env', `env must be one of ${Object.keys(ENVS).join(', ')}`); return e; };
const needCrew = (id) => { const c = CREW.find(x => x.id === id); if (!c) throw new ApiError(404, 'crew_not_found', `No crew member ${id}`); return c; };
const num = (v, name, min, max) => { if (typeof v !== 'number' || Number.isNaN(v) || v < min || v > max) throw new ApiError(422, 'validation_error', `${name} must be a number from ${min} to ${max}`, { field: name }); return v; };

route('GET', '/api/v1/environments', () => ok({ environments: Object.values(ENVS), hazards: HAZARDS }));
route('GET', '/api/v1/hazards', () => ok({ hazards: HAZARDS }));
route('GET', '/api/v1/crew', () => ok({ crew: CREW }));
route('GET', '/api/v1/crew/:id/snapshot', ({ params, q }) => {
  const c = needCrew(params.id), env = needEnv(q);
  const day = q.has('day') ? num(+q.get('day'), 'day', 0, 400) : sim.day;
  return ok({ crew: c, day, environment: env, regions: systems(env, c.id),
    radiation: { cumulativeMSv: +cum(env, day).toFixed(1), limitMSv: LIMIT, ratePerDay: +rate(env).toFixed(2), speActive: speOn() },
    habitat: { modules: MODULES, cabinTempC: 21.4, co2Ppm: 2800 } });
});
route('GET', '/api/v1/crew/:id/regions/:region', ({ params, q }) => {
  needCrew(params.id); const env = needEnv(q);
  if (!SYSTEMS[params.region]) throw new ApiError(404, 'region_not_found', `Unknown region ${params.region}`);
  const keys = { brain: ['reaction_ms', 'sleep_hours'], eye: ['sleep_hours'], marrow: ['cumulative_dose', 'heart_rate'], gi: ['heart_rate'] }[params.region];
  return ok({ region: params.region, name: SYSTEMS[params.region], indicators: keys.map(k => {
    const s = series(env, k, Math.max(0, sim.day - 14)), v = s.at(-1).value, base = s[0].value;
    return { key: k, value: v, baseline: base, pctChange: +(((v - base) / base) * 100).toFixed(1), referenceRange: BASELINE[k], sparkline: s.map(p => p.value) };
  }) });
});
route('GET', '/api/v1/crew/:id/indicators/:key', ({ params, q }) => {
  needCrew(params.id); const env = needEnv(q);
  const s = series(env, params.key, +(q.get('from') || 0), +(q.get('to') || sim.day));
  if (!s) throw new ApiError(404, 'indicator_not_found', `Unknown indicator ${params.key}`);
  const [lo, hi] = BASELINE[params.key];
  return ok({ key: params.key, baselineBand: { low: lo, high: hi }, series: s });
});
route('GET', '/api/v1/alerts', ({ q }) => {
  let a = alerts;
  for (const k of ['status', 'severity', 'region']) if (q.get(k)) a = a.filter(x => x[k] === q.get(k));
  return ok({ alerts: a });
});
route('POST', '/api/v1/alerts/:id/acknowledge', ({ params }) => {
  const a = alerts.find(x => x.id === params.id); if (!a) throw new ApiError(404, 'alert_not_found', 'No such alert');
  a.status = 'acknowledged'; a.acknowledgedAt = new Date().toISOString(); return ok(a);
});
route('GET', '/api/v1/habitat', ({ q }) => { const env = needEnv(q); return ok({
  readings: { cabinTempC: 21.4, humidityPct: 44, co2Ppm: sim.scenario === 'ff' ? 3400 : 2800, noiseDb: 52 },
  correlations: [{ habitat: 'co2Ppm', outcome: 'fatigue', r: 0.62, note: 'Higher CO2 tracks with higher fatigue and slower reactions (simulated).' },
                 { habitat: 'noiseDb', outcome: 'sleep_hours', r: -0.48, note: 'Noise correlates with shorter sleep (simulated).' }] }); });
route('GET', '/api/v1/radiation/budget', ({ q }) => { const env = needEnv(q), c = cum(env); return ok({
  limitMSv: LIMIT, priorCareerMSv: PRIOR, cumulativeMSv: +c.toFixed(1), remainingMSv: +(LIMIT - c).toFixed(1), pctOfLimit: +((c / LIMIT) * 100).toFixed(1), principle: 'ALARA', standard: 'NASA-STD-3001' }); });
route('POST', '/api/v1/radiation/simulate-spe', ({ body }) => {
  const mSv = body?.mSv === undefined ? 25 : num(body.mSv, 'mSv', 1, 200);
  sim.flares.push({ day: sim.day, mSv }); sim.speUntil = Date.now() + 10 * 60 * 1000;
  const a = { id: 'al_' + (alerts.length + 1), severity: 'critical', status: 'open', region: 'gi', message: 'X-class solar flare. Move to Water-Wall Cargo Bay.', createdAt: new Date().toISOString() };
  alerts.push(a); return ok({ event: { mSv, shelterSeconds: 600 }, alert: a }, 201);
});
route('POST', '/api/v1/checkins', ({ body }) => {
  if (!body || typeof body !== 'object') throw new ApiError(400, 'invalid_body', 'JSON body required');
  const c = needCrew(body.crewId);
  const e = {
    id: 'ci_' + (sim.checkins.length + 1), crewId: c.id, day: sim.day, at: new Date().toISOString(),
    mood: num(body.mood, 'mood', 1, 5), stress: num(body.stress, 'stress', 1, 5),
    vitals: { heartRate: num(body.vitals?.heartRate, 'vitals.heartRate', 30, 220), coreTempC: num(body.vitals?.coreTempC, 'vitals.coreTempC', 34, 42) },
    visionTest: body.visionTest ?? null, webcamPulse: body.webcamPulse ?? null,
    symptoms: Array.isArray(body.symptoms) ? body.symptoms.map(String) : [],
  };
  sim.checkins.push(e); return ok(e, 201);
});
route('GET', '/api/v1/crew/:id/report', ({ params, q }) => {
  const c = needCrew(params.id), env = needEnv(q), s = systems(env, c.id), cu = cum(env);
  const json = { crew: c, day: sim.day, environment: env, doseMSv: +cu.toFixed(1), regions: s, checkins: sim.checkins.filter(x => x.crewId === c.id).length };
  if (q.get('format') === 'text') return { status: 200, text: `FLIGHT SURGEON REPORT (SIMULATED)\n${c.name}, mission day ${sim.day}, ${ENVS[env].name}\nCareer dose: ${cu.toFixed(1)} / ${LIMIT} mSv\n` + s.map(r => `- ${r.name}: ${r.status}${r.drivers.length ? ' (' + r.drivers.join('; ') + ')' : ''}`).join('\n') + '\n' };
  return ok(json);
});
route('GET', '/api/v1/simulation', () => ok({ day: sim.day, scenario: sim.scenario, flares: sim.flares, speActive: speOn() }));
route('POST', '/api/v1/simulation/day', ({ body }) => { sim.day = num(body?.day, 'day', 0, 400); return ok({ day: sim.day }); });
route('POST', '/api/v1/simulation/reset', () => { Object.assign(sim, { day: 14, scenario: 'nominal', flares: [], checkins: [], speUntil: 0 }); alerts.length = 0; return ok({ reset: true }); });
route('POST', '/api/v1/simulation/scenario', ({ body }) => {
  if (!['nominal', 'ff'].includes(body?.scenario)) throw new ApiError(422, 'validation_error', "scenario must be 'nominal' or 'ff'", { field: 'scenario' });
  sim.scenario = body.scenario; if (body.scenario === 'ff') { sim.day = 180; sim.flares = [{ day: 62, mSv: 18 }, { day: 131, mSv: 18 }]; } return ok({ scenario: sim.scenario, day: sim.day });
});
const sse = new Set();
route('GET', '/api/v1/stream', ({ res }) => { // Server-Sent Events: live simulated readings
  res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive', 'access-control-allow-origin': '*' });
  sse.add(res); res.on('close', () => sse.delete(res)); return { handled: true };
});
setInterval(() => { const p = JSON.stringify({ simulated: true, t: new Date().toISOString(), heartRate: Math.round(64 + Math.random() * 10), reactionMs: Math.round(290 + Math.random() * 40) }); for (const r of sse) r.write(`event: reading\ndata: ${p}\n\n`); }, 2000);

// ---------- server ----------
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type' };
http.createServer(async (req, res) => {
  const send = (status, obj, type = 'application/json') => { res.writeHead(status, { 'content-type': type, ...CORS }); res.end(type === 'application/json' ? JSON.stringify(obj) : obj); };
  if (req.method === 'OPTIONS') return send(204, '', 'text/plain');
  try {
    const url = new URL(req.url, 'http://x');
    const hit = routes.map(r => r.m === req.method && { r, m: url.pathname.replace(/\/$/, '').match(r.re) }).find(x => x && x.m);
    if (!hit) throw new ApiError(404, 'not_found', `No route ${req.method} ${url.pathname}`);
    let body = null;
    if (req.method === 'POST') { let raw = ''; for await (const c of req) raw += c; try { body = raw ? JSON.parse(raw) : {}; } catch { throw new ApiError(400, 'invalid_json', 'Body is not valid JSON'); } }
    const out = hit.r.h({ params: hit.m.groups || {}, q: url.searchParams, body, res });
    if (out.handled) return;
    if (out.text) return send(200, out.text, 'text/plain');
    send(out.status, out.body);
  } catch (e) {
    const status = e.status || 500;
    send(status, { simulated: true, error: { code: e.code || 'internal_error', message: e.message, ...(e.details ? { details: e.details } : {}) } });
  }
}).listen(3001, () => console.log('BioDeck-MD API (simulated data) on http://localhost:3001/api/v1'));
