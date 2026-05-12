import { FieldDef } from "../model";

/**
 * Forward single (multi=false) relation. Emits a single FK column on the
 * parent patch — there is no nested-mutation equivalent in PostGraphile v5.
 *
 *   - connect (no change or change to a different id): patch.<fk> = newVal.id
 *   - disconnect:                                       patch.<fk> = null
 *   - no-op:                                            {}
 *
 * Inline create of a related row (the v4 `linkedObject` pattern) is not
 * supported here. If the child needs to be created first, emit a separate
 * `create` op for it and pass the resulting id into the parent patch.
 */
export const buildLink = (
  fieldDef: FieldDef,
  originalVal: any,
  newVal: any
): Record<string, any> => {
  const fk = fieldDef.foreignKey;
  if (!fk) return {};

  const origId = originalVal?.id ?? null;
  const newId = newVal?.id ?? null;

  if (origId === newId) return {};
  return { [fk]: newId };
};
