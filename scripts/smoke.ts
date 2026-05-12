/* eslint-disable no-console */
// Import directly from operations/ to avoid pulling in the React-coupled useForm.
import { buildOperations, composeMutation } from "../src/operations";
import type { MutationRegistry } from "../src/operations";
import type { Model } from "../src/model";

let nextId = 0;
const fakeNewId = () => `new-${++nextId}`;

const model: Model = {
  Trip: {
    name: { type: "string" },
    customer: { type: "Customer", foreignKey: "customerId" },
    tripFlights: {
      type: "TripFlight",
      multi: true,
      foreignKey: "tripId",
    },
  },
  TripFlight: {
    carrier: { type: "string" },
    number: { type: "string" },
    departure: { type: "datetime" },
    arrival: { type: "datetime" },
  },
  Customer: { name: { type: "string" } },
};

const registry: MutationRegistry = {
  Trip: {
    update: { mutation: "updateTrip", patchType: "TripPatch" },
    create: { mutation: "createTrip", inputKey: "trip", inputType: "TripInput" },
  },
  TripFlight: {
    create: {
      mutation: "createTripFlight",
      inputKey: "tripFlight",
      inputType: "TripFlightInput",
    },
    update: { mutation: "updateTripFlight", patchType: "TripFlightPatch" },
    delete: { mutation: "deleteTripFlight" },
  },
};

const TRIP_ID = "11111111-1111-1111-1111-111111111111";
const EXISTING_FLIGHT_ID = "22222222-2222-2222-2222-222222222222";
const REMOVED_FLIGHT_ID = "33333333-3333-3333-3333-333333333333";

const original = {
  id: TRIP_ID,
  name: "Smith trip",
  customer: { id: "c1" },
  tripFlights: {
    nodes: [
      { id: EXISTING_FLIGHT_ID, carrier: "QF", number: "1" },
      { id: REMOVED_FLIGHT_ID, carrier: "ZZ", number: "9" },
    ],
  },
};

const updated = {
  id: TRIP_ID,
  name: "Smith trip — revised",
  customer: { id: "c2" }, // forward link change → patch.customerId = "c2"
  tripFlights: {
    nodes: [
      // existing, edited
      { id: EXISTING_FLIGHT_ID, carrier: "QF", number: "12" },
      // new
      { carrier: "NZ", number: "101", departure: "2030-01-01T00:00:00Z", arrival: "2030-01-01T01:00:00Z" },
      // REMOVED_FLIGHT_ID missing → delete
    ],
  },
};

const plan = buildOperations(model, "Trip", original, updated, { newId: fakeNewId });
console.log("--- SavePlan ---");
console.log(JSON.stringify(plan, null, 2));

const composed = composeMutation({
  rootType: "Trip",
  rootKind: "update",
  rootId: TRIP_ID,
  plan,
  registry,
});
console.log("\n--- Document ---");
console.log(composed.document);
console.log("\n--- Variables ---");
console.log(JSON.stringify(composed.variables, null, 2));

// Assertions
const assertEq = (label: string, actual: unknown, expected: unknown) => {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`✗ ${label}\n  actual:   ${a}\n  expected: ${e}`);
  } else {
    console.log(`✓ ${label}`);
  }
};

console.log("\n--- Assertions ---");
assertEq("root patch contains scalar diff", plan.patch.name, "Smith trip — revised");
assertEq("root patch contains FK column for forward link", plan.patch.customerId, "c2");
assertEq(
  "root patch has no nested mutation keys",
  Object.keys(plan.patch).filter((k) => k.endsWith("UsingId") || k.endsWith("ToCustomerId")),
  []
);
assertEq("ops count is 3 (delete + update + create)", plan.ops.length, 3);
assertEq(
  "ops kinds in order: delete, update, create",
  plan.ops.map((o) => o.kind),
  ["delete", "update", "create"]
);
assertEq("create op carries parent FK (tripId)", (plan.ops[2] as any).input.tripId, TRIP_ID);
assertEq("create op carries client-generated id", (plan.ops[2] as any).input.id, "new-1");
assertEq(
  "composed document includes root mutation alias",
  composed.document.includes("root: updateTrip"),
  true
);
assertEq(
  "composed document includes all three child aliases",
  ["d0:", "u1:", "c2:"].every((s) => composed.document.includes(s)),
  true
);
assertEq("composed variables include rootPatch", typeof composed.variables.rootPatch, "object");

console.log("\nAll smoke assertions passed.");
