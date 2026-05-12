export type FieldDef = {
  type: "string" | "string[]" | "number" | "boolean" | "date" | "datetime" | string;
  /**
   * For a relation, the column on this entity (multi=false) or on the child
   * entity (multi=true) that holds the foreign key.
   *
   * Forward single (multi=false):
   *   { type: "Customer", foreignKey: "customerId" }
   *   → sets parent.customerId = <id> in the parent patch.
   *
   * Inverse many (multi=true):
   *   { type: "TripFlight", multi: true, foreignKey: "tripId" }
   *   → each created child row gets tripId = <parent.id> applied.
   */
  multi?: boolean;
  foreignKey?: string;
};

export type Model = {
  [typeKey: string]: { [fieldKey: string]: FieldDef | string };
};
