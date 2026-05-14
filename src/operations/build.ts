import { Model, FieldDef } from "../model";
import { Op, SavePlan } from "./types";
import { buildLink } from "./buildLink";
import { buildMulti } from "./buildMulti";

export type BuildOptions = {
  /**
   * Generator for client-assigned IDs on newly created rows. Defaults to
   * crypto.randomUUID() if available. Client-assigned IDs are required so
   * grandchildren can reference their parent's id within the same atomic
   * mutation document.
   */
  newId?: () => string;
  /**
   * Existing id of the root entity (when updating). Required so any new
   * child rows on a multi field can have their FK set correctly. Omit when
   * the root itself is being created — a new id will be generated and
   * exposed on the returned SavePlan via the implicit `id` column in
   * `patch`.
   */
  rootId?: string;
};

const defaultNewId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  throw new Error(
    "use-graphile: crypto.randomUUID is unavailable; provide BuildOptions.newId"
  );
};

const parseValue = (type: string, value: any): any => {
  switch (type) {
    case "number":
      if (typeof value === "number") return value;
      return parseFloat(value);
    case "string[]":
      return (value instanceof Array ? value : (value || "").split(","))
        .filter((a: any) => !!a)
        .map((a: any) => a.trim());
    case "boolean":
      return value ?? false;
    case "date":
    case "datetime":
    case "string":
    default:
      return value ? value : null;
  }
};

const equal = (a: any, b: any): boolean => {
  if (a instanceof Array && b instanceof Array) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
  }
  return a === b;
};

/**
 * Walk the model and produce a flat root patch plus an ordered list of
 * child operations. Suitable for execution against a PostGraphile v5 server
 * (no nested patch inputs).
 */
export const buildOperations = (
  model: Model,
  type: string,
  originalValues: any,
  newValues: any,
  opts: BuildOptions = {}
): SavePlan => {
  const newId = opts.newId ?? defaultNewId;
  const ops: Op[] = [];
  const rootId =
    opts.rootId ?? (originalValues as any)?.id ?? (newValues as any)?.id ?? null;
  const patch = buildPatchInternal(
    model,
    type,
    originalValues ?? {},
    newValues ?? {},
    rootId,
    ops,
    newId
  );
  return { patch, ops };
};

/**
 * Build a flat patch for an entity, appending child ops to `ops`.
 *
 * `thisRowId` is the id of the row whose patch we're building. It is used
 * as the FK target for child rows on multi fields. Pass `null` only when
 * this row has no multi children (or when callers explicitly don't need FK
 * wiring).
 */
export const buildPatchInternal = (
  model: Model,
  type: string,
  originalValues: any,
  newValues: any,
  thisRowId: string | null,
  ops: Op[],
  newId: () => string
): Record<string, any> => {
  const typeDef = model[type];
  if (!typeDef) {
    console.warn(`use-graphile: unknown type '${type}'`);
    return {};
  }
  const fields = Object.keys(typeDef);

  return fields.reduce<Record<string, any>>((p, key) => {
    const fieldDef = typeDef[key];
    const fieldType = typeof fieldDef === "string" ? fieldDef : fieldDef.type;
    const multi = typeof fieldDef === "string" ? false : fieldDef.multi;
    const originalVal = originalValues[key];
    const newVal = newValues[key];

    if (multi && model[fieldType]) {
      buildMulti(
        model,
        fieldDef as FieldDef,
        originalVal,
        newVal,
        thisRowId,
        ops,
        newId
      );
      return p;
    }

    if (model[fieldType]) {
      const fkPatch = buildLink(fieldDef as FieldDef, originalVal, newVal);
      // When the link points to the same row, recurse so nested edits on the
      // linked entity surface as their own update op (v5 has no nested patches).
      const origId = originalVal?.id ?? null;
      const newId2 = newVal?.id ?? null;
      if (origId && newId2 && origId === newId2) {
        const childOps: Op[] = [];
        const linkedPatch = buildPatchInternal(
          model,
          fieldType,
          originalVal,
          newVal,
          origId,
          childOps,
          newId
        );
        if (Object.keys(linkedPatch).length > 0) {
          ops.push({
            kind: "update",
            type: fieldType,
            id: origId,
            patch: linkedPatch,
          });
        }
        ops.push(...childOps);
      }
      return { ...p, ...fkPatch };
    }

    if (equal(originalVal, newVal)) return p;
    if (newVal !== undefined || originalVal) {
      return { ...p, [key]: parseValue(fieldType, newVal) };
    }
    return p;
  }, {});
};
