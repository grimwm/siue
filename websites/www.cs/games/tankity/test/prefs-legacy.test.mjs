// Settings saved by the code before the prefs move, in the raw form it wrote
// them, must read back unchanged through today's prefs.
import { check } from '../../_kit/test/check.ts';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';
import { pref, text } from '../../_kit/prefs.ts';
import { LEGACY_KEY, localBoard } from '../src/local-board.ts';

const saved = memoryStorage({
  'tankity-body': 'walker',
  'tankity-text': 'xl',
  'tankity-tutorial': 'done',
  'tankity-callsign': 'BAM',
});

check('legacy-body-reads-back', pref('tankity-body', 'tank', text, saved).get() === 'walker');
check('legacy-text-size-reads-back', pref('tankity-text', 'm', text, saved).get() === 'xl');
check('legacy-tutorial-done-reads-back', pref('tankity-tutorial', '', text, saved).get() === 'done');
check('legacy-callsign-reads-back', pref('tankity-callsign', '', text, saved).get() === 'BAM');

const empty = memoryStorage();
check('fresh-body-is-the-default', pref('tankity-body', 'tank', text, empty).get() === 'tank');
check('fresh-text-size-is-normal', pref('tankity-text', 'm', text, empty).get() === 'm');
check('fresh-tutorial-is-unseen', pref('tankity-tutorial', '', text, empty).get() === '');

const written = memoryStorage();
pref('tankity-body', 'tank', text, written).set('hover');
check('body-is-written-as-the-bare-key', written.data.get('tankity-body') === 'hover');
check('blocked-storage-gives-the-default', pref('tankity-body', 'tank', text, throwingStorage()).get() === 'tank');

// Main's tankity-local (runs its filer could not file), in the raw form it wrote, moves onto this browser's board.
const mainLocal = memoryStorage({ [LEGACY_KEY]: '[{"name":"WGR","score":8240,"banked":3,"won":false,"seed":"scorched-1234","difficulty":"hard"},{"name":"BAM","score":100,"banked":0,"won":false,"seed":"x"}]' });
const moved = localBoard(mainLocal);
check('legacy-local-rows-move', moved.migrate() === 2);
check('legacy-local-hard-row-reads-back', moved.rows('hard')?.[0]?.score === 8240 && moved.rows('hard')?.[0]?.initials === 'WGR');
check('legacy-local-row-without-difficulty-is-normal', moved.rows('normal')?.[0]?.initials === 'BAM');
check('legacy-local-key-removed', mainLocal.data.has(LEGACY_KEY) === false);
