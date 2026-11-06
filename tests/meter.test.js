// Run: node tests/meter.test.js
// Extracts the METER block from the app and checks the craft measures.
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'src', 'blowtorch.body.html'), 'utf8');
const m = html.match(/\/\/ <METER>([\s\S]*?)\/\/ <\/METER>/);
if (!m) { console.error('METER block not found'); process.exit(1); }
const METER = new Function(m[1] + '; return METER;')();
let fails = 0;
const check = (name, ok, detail) => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? '  ' + detail : '')); if (!ok) fails++; };

// syllables (estimates from spelling)
const syl = { "I'm coming home": 4, 'Over the hills and the':5, 'window': 2, 'fire': 1, 'beautiful': 3 };
for (const [t, want] of Object.entries(syl)) { const got = METER.countSyl(t); check('syllables "' + t + '"', Math.abs(got - want) <= 1, 'got ' + got + ', want about ' + want); }

// holdable endings
const holdYes = ['I am home', 'sing a song along', 'sweet and free', 'I will go', 'we shine', 'the river flow', 'the high sky', 'bring me love', 'come now'];
const holdNo = ['the road', 'my heart', 'hold your hands', 'the night', 'turn it back', 'take a step', 'the dark'];
holdYes.forEach(t => check('holdable: "' + t + '"', METER.holdable(t) === true));
holdNo.forEach(t => check('not holdable: "' + t + '"', METER.holdable(t) === false));

// similarity and repeats
check('identical lines are similar', METER.sim('Hold on, I am home', 'hold on i am home') === 1);
check('unrelated lines are not similar', METER.sim('Hold on', 'river runs deep') === 0);
const rep = METER.measure(['Hold on', 'river runs deep today', 'Hold on', 'something else again', 'Hold on', 'more words here'], null);
check('3 of 6 repeated lines', Math.abs(rep.repeat - 2 / 6) < 1e-9, 'repeat=' + rep.repeat.toFixed(3) + ' (lines 3 and 5 repeat line 1)');
check('exact repeats give variation 0', rep.vary === 0, 'vary=' + rep.vary);
const noRep = METER.measure(['one two three', 'four five six', 'seven eight nine'], null);
check('no repeats gives vary null', noRep.vary === null && noRep.repeat === 0);

// call/answer ratio, first person, interjections
const ca = METER.measure(['Hold on', 'over every hill and valley wide', 'Hold on', 'over every river and the sea'], 3);
check('call shorter than answer', ca.call < 0.5, 'ratio=' + ca.call.toFixed(2));
const fp = METER.measure(['I am here', 'you are there', 'we go on', 'it rains'], null);
check('first person share 2 of 4', fp.first === 0.5);
check("I'm and I'll count as first person", METER.measure(["I'm here", "it rains", "I'll go", 'plain line'], null).first === 0.5);
const ij = METER.measure(['Yes, I know', 'it rains', 'oh well', 'plain line'], null);
check('interjection share 2 of 4', ij.inter === 0.5);
check('peak position is line / total', METER.measure(['a', 'b', 'c', 'd'], 3).peak === 0.75);

// The example verse shown at rest should match the preset it is shown with
const ex = [
  "Hold on, I'm coming home", "Over the hills and the river's flow", "Hold on, I'm almost home", 'Every stone I carried turns to gold',
  "Oh, I'm coming back", 'Light in the window, light in the sky', "Yes, hold on, I'm home", "Over the hills, the river's flow sings along"
];
const mea = METER.measure(ex, 6);
const preset = { repeat: 40, vary: 50, syl: 8, call: 60, first: 60, open: 75, peak: 80, inter: 25 };
const rows = METER.compare(preset, mea);
rows.forEach(r => console.log('   ' + r.label.padEnd(24) + 'target ' + METER.fmtVal(r.target, r.fmt).padEnd(8) + 'measured ' + METER.fmtVal(r.measured, r.fmt).padEnd(8) + (r.ok ? 'on target' : 'OFF')));
check('example verse is on target for the Mahalia preset on every measure', rows.every(r => r.ok === true));

console.log(fails ? '\n' + fails + ' check(s) failed' : '\nall checks passed');
process.exit(fails ? 1 : 0);
