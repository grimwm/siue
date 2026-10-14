/* Operation Tankity: the earth, as the shells move it.
 *
 * The ground is a height map (terrain[x] is the surface's y at column x; y
 * grows downward), and every op here is a pure function of it: a crater, a
 * mound of dirt, a pool of liquid dirt, slopes slumping, a trench a digger
 * cuts, a riot charge's scoop. The war (sim.ts), the room replay and the
 * firing range all move the ground with these, and server/earth.php is the
 * same ops to the last bit, kept in step by the `earth` group of
 * protocol/sim-vectors.json. No imports from sim.ts: sim.ts imports this. */
