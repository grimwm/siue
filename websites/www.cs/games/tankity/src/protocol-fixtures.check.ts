/* Type-check only: the server's real replies must fit the client's types.
 *
 * Every protocol/*.json fixture (written by protocol/generate.php from
 * rooms.php's own output) is imported here and held against the type that
 * says what the client expects of it. `tsc` then fails when rooms.php changes
 * a reply's shape and the fixtures are regenerated, and when a fixture holds
 * a field protocol.ts does not know. the kit build (build.json) type-checks it
 * (`make test`); it is never bundled.
 *
 * A JSON import types every string as plain `string`, so the literal unions
 * (phase, event `t`, seat mode) cannot be checked here; test/protocol.test.ts
 * checks those values against protocol.ts. */
import type { ChallengeReply, ErrorReply, LocalReply, MineReply, RoomReply, SeatReply } from './protocol.ts';
import challengeReply from '../protocol/challenge-reply.json' with { type: 'json' };
import errorPuzzle from '../protocol/error-puzzle.json' with { type: 'json' };
import createReply from '../protocol/create-reply.json' with { type: 'json' };
import joinReply from '../protocol/join-reply.json' with { type: 'json' };
import errorNotYourTurn from '../protocol/error-not-your-turn.json' with { type: 'json' };
import errorTooFast from '../protocol/error-too-fast.json' with { type: 'json' };
import errorReload from '../protocol/error-reload.json' with { type: 'json' };
import startLocalReply from '../protocol/start-local-reply.json' with { type: 'json' };
import lobbyHost from '../protocol/lobby-host.json' with { type: 'json' };
import lobbyPublic from '../protocol/lobby-public.json' with { type: 'json' };
import playMyTurn from '../protocol/play-my-turn.json' with { type: 'json' };
import playAfterFire from '../protocol/play-after-fire.json' with { type: 'json' };
import playAfterFireDelta from '../protocol/play-after-fire-delta.json' with { type: 'json' };
import playAfterBeam from '../protocol/play-after-beam.json' with { type: 'json' };
import playAfterRing from '../protocol/play-after-ring.json' with { type: 'json' };
import playAfterEarth from '../protocol/play-after-earth.json' with { type: 'json' };
import playAfterBurn from '../protocol/play-after-burn.json' with { type: 'json' };
import playResync from '../protocol/play-resync.json' with { type: 'json' };
import playTurntime from '../protocol/play-turntime.json' with { type: 'json' };
import playSpeed from '../protocol/play-speed.json' with { type: 'json' };
import mineReply from '../protocol/mine-reply.json' with { type: 'json' };
import shopAfterWin from '../protocol/shop-after-win.json' with { type: 'json' };
import shopReady from '../protocol/shop-ready.json' with { type: 'json' };

/** The declared type with every literal widened to its primitive, which is
 * all a JSON import can say. */
type Widen<T> =
  T extends string ? string
    : T extends number ? number
      : T extends boolean ? boolean
        : T extends readonly (infer E)[] ? Widen<E>[]
          : T extends object ? { [K in keyof T]: Widen<T[K]> }
            : T;

type KeysOfUnion<T> = T extends unknown ? keyof T : never;

/** `Declared[K]` over the members of a union that `Actual` is assignable to. */
type Prop<Declared, K extends PropertyKey, Actual> =
  Declared extends unknown
    ? (Actual extends Declared ? (K extends keyof Declared ? Declared[K] : never) : never)
    : never;

/** The keys the fixture holds that the declared type lacks, as a union of
 * their names (`never` when there are none): plain assignability lets an extra
 * field through. Where the declared type is a union (the events), the keys
 * allowed are those of the members the fixture's object is assignable to, so
 * an event that lost a field it needs, or grew one it should not have, shows
 * up as extra keys. */
type Extras<Actual, Declared> =
  Actual extends readonly (infer AE)[]
    ? (Declared extends readonly (infer DE)[] ? Extras<AE, DE> : never)
    : Actual extends object
      ? {
        [K in keyof Actual]-?: [Actual[K]] extends [undefined]
          ? never // TS pads a list's object types with `key?: undefined` for the keys its other elements have
          : K extends KeysOfUnion<Matches<Declared, Actual>>
            ? Extras<Actual[K], Prop<Declared, K, Actual>>
            : K
      }[keyof Actual]
      : never;

/** The members of a union that `Actual` is assignable to. */
type Matches<Declared, Actual> = Declared extends unknown ? (Actual extends Declared ? Declared : never) : never;

/** `true` when the fixture fits the declared type and holds nothing more.
 * Otherwise a type naming the trouble, so the error below says which keys the
 * type does not know (`extraKeys`) or that the shape differs (`mismatch`). */
type Fits<Actual, Declared> =
  [Actual] extends [Widen<Declared>]
    ? ([Extras<Actual, Widen<Declared>>] extends [never] ? true : { extraKeys: Extras<Actual, Widen<Declared>> })
    : { mismatch: Actual };

/** One entry per fixture; tsc names the entry whose fixture drifted. */
export const fixturesFit: {
  createReply: Fits<typeof createReply.body, SeatReply>;
  joinReply: Fits<typeof joinReply.body, SeatReply>;
  errorNotYourTurn: Fits<typeof errorNotYourTurn.body, ErrorReply>;
  errorTooFast: Fits<typeof errorTooFast.body, ErrorReply>;
  errorReload: Fits<typeof errorReload.body, ErrorReply>;
  challengeReply: Fits<typeof challengeReply.body, ChallengeReply>;
  errorPuzzle: Fits<typeof errorPuzzle.body, ErrorReply>;
  startLocalReply: Fits<typeof startLocalReply.body, LocalReply>;
  lobbyHost: Fits<typeof lobbyHost.body, RoomReply>;
  lobbyPublic: Fits<typeof lobbyPublic.body, RoomReply>;
  playMyTurn: Fits<typeof playMyTurn.body, RoomReply>;
  playAfterFire: Fits<typeof playAfterFire.body, RoomReply>;
  playAfterFireDelta: Fits<typeof playAfterFireDelta.body, RoomReply>;
  playAfterBeam: Fits<typeof playAfterBeam.body, RoomReply>;
  playAfterRing: Fits<typeof playAfterRing.body, RoomReply>;
  playAfterEarth: Fits<typeof playAfterEarth.body, RoomReply>;
  playAfterBurn: Fits<typeof playAfterBurn.body, RoomReply>;
  playResync: Fits<typeof playResync.body, RoomReply>;
  playTurntime: Fits<typeof playTurntime.body, RoomReply>;
  playSpeed: Fits<typeof playSpeed.body, RoomReply>;
  mineReply: Fits<typeof mineReply.body, MineReply>;
  shopAfterWin: Fits<typeof shopAfterWin.body, RoomReply>;
  shopReady: Fits<typeof shopReady.body, RoomReply>;
} = {
  createReply: true,
  joinReply: true,
  errorNotYourTurn: true,
  errorTooFast: true,
  errorReload: true,
  challengeReply: true,
  errorPuzzle: true,
  startLocalReply: true,
  lobbyHost: true,
  lobbyPublic: true,
  playMyTurn: true,
  playAfterFire: true,
  playAfterFireDelta: true,
  playAfterBeam: true,
  playAfterRing: true,
  playAfterEarth: true,
  playAfterBurn: true,
  playResync: true,
  playTurntime: true,
  playSpeed: true,
  mineReply: true,
  shopAfterWin: true,
  shopReady: true,
};
