/* Operation Tankity: fire, as the napalm burns.
 *
 * A napalm shell pours burning liquid where it bursts: a pool found once, by
 * the earth's pour (earth.ts pourLevel) on the ground of that moment, which
 * burns where it lies for the gun's `burn` seconds and never changes the
 * ground. Every `tick` seconds each unit whose body reaches into its flames
 * takes the gun's damage. The war (sim.ts), the room replay and the firing
 * range all burn with these, and server/fire.php is the same to the last
 * bit, kept in step by the `fire` group of protocol/sim-vectors.json. No
 * imports from sim.ts: sim.ts imports this. */
