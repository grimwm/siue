<?php
// A draft as it arrives, before it is kept: the SIUED1 bundle read into its files, and the first reason those files
// cannot be kept. The AI's publish (api/drafts.php) and the editor's save (save-draft.php) both check drafts here.
declare(strict_types=1);

namespace Music;

final class DraftCheck
{
    /** @return array<string, string>|null name => bytes, or null for a malformed bundle */
    public static function parseBundle(string $body): ?array
    {
        $magic = strlen(Api::DRAFT_MAGIC);
        $end = strlen($body);
        if ($end < $magic + 1 || !str_starts_with($body, Api::DRAFT_MAGIC)) {
            return null;
        }
        $count = ord($body[$magic]);
        if ($count < 1 || $count > 5) {
            return null;
        }
        $at = $magic + 1;
        $files = [];
        for ($i = 0; $i < $count; $i++) {
            if ($at >= $end) {
                return null;
            }
            $nameLength = ord($body[$at]);
            $at++;
            if ($at + $nameLength + 4 > $end) {
                return null;
            }
            $name = substr($body, $at, $nameLength);
            $at += $nameLength;
            $size = unpack('N', substr($body, $at, 4))[1];
            $at += 4;
            if (!in_array($name, Store::DRAFT_FILES, true) || isset($files[$name]) || $at + $size > $end) {
                return null;
            }
            $files[$name] = substr($body, $at, $size);
            $at += $size;
        }
        return $at === $end ? $files : null;
    }

    /** A renderable score lists no audio file and gives every lane a sound and the piece a mix: the page plays it itself. */
    private static function isRenderable(array $score): bool
    {
        if (($score['audio'] ?? null) !== [] || !is_array($score['mix'] ?? null) || !is_array($score['lanes'] ?? null) || $score['lanes'] === []) {
            return false;
        }
        foreach ($score['lanes'] as $lane) {
            if (!is_array($lane) || !is_array($lane['sound'] ?? null)) {
                return false;
            }
        }
        return true;
    }

    /**
     * The first reason the files cannot be kept, or null; then $about holds the score's project and kind.
     * @param array<string, string> $files
     * @param list<string> $instruments the library's instrument names
     * @param array{project_id: string, project_name: string, kind: string}|null $about
     * $scoreAlone takes a music score without MusicXML from any account (the editor's drafts), not only a score-only one.
     */
    public static function checkFiles(array $files, string $piece, int $version, Limits $limits, array $instruments, ?array &$about, bool $scoreAlone = false): ?string
    {
        if (!isset($files['score.json'])) {
            return 'missing_file';
        }
        $score = json_decode($files['score.json'], true);
        if (!is_array($score) || ($score['schema'] ?? null) !== 1
            || !is_array($score['piece'] ?? null) || ($score['piece']['id'] ?? null) !== $piece
            || ($score['draft'] ?? null) !== $version
            || !in_array($score['kind'] ?? null, Store::KINDS, true)
            || !is_array($score['project'] ?? null)) {
            return 'bad_score';
        }
        if ($refusal = ScoreRules::check($files, $score, $limits, $instruments)) {
            return $refusal;
        }
        $id = $score['project']['id'] ?? null;
        $name = $score['project']['name'] ?? null;
        if (!Store::validProjectId($id) || !Store::validProjectName($name)) {
            return 'bad_score';
        }
        if (isset($files['spectrogram.png']) && !str_starts_with($files['spectrogram.png'], "\x89PNG")) {
            return 'bad_file';
        }
        if (isset($files['audio.webm']) && !str_starts_with($files['audio.webm'], "\x1A\x45\xDF\xA3")) {
            return 'bad_file';
        }
        if (isset($files['audio.m4a']) && substr($files['audio.m4a'], 4, 4) !== 'ftyp') {
            return 'bad_file';
        }
        if (!isset($files['audio.webm']) && !isset($files['audio.m4a']) && !self::isRenderable($score)) {
            return 'missing_file';
        }
        if (!isset($files['score.musicxml'])) {
            if ($score['kind'] === 'music' && !$limits->scoreOnly && !$scoreAlone) {
                return 'missing_file';
            }
        } elseif (!str_contains($files['score.musicxml'], '<score-partwise')) {
            return 'bad_file';
        }
        $about = ['project_id' => $id, 'project_name' => $name, 'kind' => $score['kind']];
        return null;
    }
}
