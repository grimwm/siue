// Settings saved by the code before the prefs move, in the raw form it wrote
// them, must read back unchanged through today's prefs.
import { check } from '../../_kit/test/check.ts';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';
import { json, pref, text } from '../../_kit/prefs.ts';
import { isScoreRows } from '../src/score-rows.ts';

const ROWS = [{ name: 'bam', score: 120, banked: 3, won: true, seed: 'abc123' }];
const saved = memoryStorage({
  'tankity-body': 'walker',
  'tankity-text': 'xl',
  'tankity-tutorial': 'done',
  'tankity-local': JSON.stringify(ROWS),
  'tankity-callsign': 'BAM',
});

check('legacy-body-reads-back', pref('tankity-body', 'tank', text, saved).get() === 'walker');
check('legacy-text-size-reads-back', pref('tankity-text', 'm', text, saved).get() === 'xl');
check('legacy-tutorial-done-reads-back', pref('tankity-tutorial', '', text, saved).get() === 'done');
check('legacy-callsign-reads-back', pref('tankity-callsign', '', text, saved).get() === 'BAM');
check('legacy-local-scores-read-back', JSON.stringify(pref('tankity-local', [], json(isScoreRows), saved).get()) === JSON.stringify(ROWS));

const empty = memoryStorage();
check('fresh-body-is-the-default', pref('tankity-body', 'tank', text, empty).get() === 'tank');
check('fresh-text-size-is-normal', pref('tankity-text', 'm', text, empty).get() === 'm');
check('fresh-tutorial-is-unseen', pref('tankity-tutorial', '', text, empty).get() === '');
check('fresh-local-scores-are-empty', pref('tankity-local', [], json(isScoreRows), empty).get().length === 0);

const written = memoryStorage();
pref('tankity-local', [], json(isScoreRows), written).set(ROWS);
pref('tankity-body', 'tank', text, written).set('hover');
check('local-scores-are-written-as-a-json-array', written.data.get('tankity-local') === JSON.stringify(ROWS));
check('body-is-written-as-the-bare-key', written.data.get('tankity-body') === 'hover');

const damaged = memoryStorage({ 'tankity-local': '[{"name":"x"}]' });
check('malformed-score-rows-fall-back-to-empty', pref('tankity-local', [], json(isScoreRows), damaged).get().length === 0);
check('unparseable-score-rows-fall-back-to-empty', pref('tankity-local', [], json(isScoreRows), memoryStorage({ 'tankity-local': '{oops' })).get().length === 0);
check('blocked-storage-gives-the-default', pref('tankity-body', 'tank', text, throwingStorage()).get() === 'tank');
