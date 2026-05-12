export type CreateOp = {
  kind: "create";
  type: string;
  /** Stable client-generated id assigned to this row. */
  id: string;
  /** The full row payload, including FK columns. */
  input: Record<string, any>;
};

export type UpdateOp = {
  kind: "update";
  type: string;
  id: string;
  patch: Record<string, any>;
};

export type DeleteOp = {
  kind: "delete";
  type: string;
  id: string;
};

export type Op = CreateOp | UpdateOp | DeleteOp;

export type SavePlan = {
  /**
   * Flat patch for the root entity. Contains scalar columns and FK columns
   * (set by forward-link fields). Does NOT contain nested mutation payloads.
   */
  patch: Record<string, any>;
  /**
   * Child operations to execute alongside the root mutation, in dependency
   * order (parents before children).
   */
  ops: Op[];
};

/**
 * Maps an entity type name to the GraphQL mutation field names and input
 * type names that the server exposes for it. The default v5 (with
 * @graphile/simplify-inflection) shape looks like:
 *
 *   {
 *     TripFlight: {
 *       create: { mutation: "createTripFlight", inputKey: "tripFlight",
 *                 inputType: "TripFlightInput" },
 *       update: { mutation: "updateTripFlight", patchType: "TripFlightPatch" },
 *       delete: { mutation: "deleteTripFlight" },
 *     }
 *   }
 */
export type EntityMutationConfig = {
  create?: { mutation: string; inputKey: string; inputType: string };
  update?: { mutation: string; patchType: string };
  delete?: { mutation: string };
};

export type MutationRegistry = Record<string, EntityMutationConfig>;
