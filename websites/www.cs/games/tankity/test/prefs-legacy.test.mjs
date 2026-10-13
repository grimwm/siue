// Settings saved by the code before the prefs move, in the raw form it wrote
// them, must read back unchanged through today's prefs.
import { check } from '../../_kit/test/check.ts';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';
import { pref, text } from '../../_kit/prefs.ts';

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
