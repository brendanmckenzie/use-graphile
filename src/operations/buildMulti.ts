import { Model, FieldDef } from "../model";
import { Op } from "./types";
import { buildPatchInternal } from "./build";

/**
 * Inverse one-to-many (multi=true) relation.
 *
 *   - rows in `new` with no id           → create op, FK = parentId
 *   - rows in both with a non-empty diff → update op
 *   - rows in original but not new       → delete op
 *
 * Recurses for grandchildren — newly created children carry their
 * client-generated id forward as the FK target for their own children.
 */
export const buildMulti = (
  model: Model,
  fieldDef: FieldDef,
  originalVal: any,
  newVal: any,
  parentId: string | null,
  ops: Op[],
  newId: () => string
): void => {
  const fk = fieldDef.foreignKey;
  if (!fk) {
    throw new Error(
      `use-graphile: multi field '${fieldDef.type}' is missing foreignKey`
    );
  }

  const originalRows: any[] = (originalVal || {}).nodes || [];
  const newRows: any[] = (newVal || {}).nodes || [];

  for (const orig of originalRows) {
    if (!newRows.find((n) => n.id === orig.id)) {
      ops.push({ kind: "delete", type: fieldDef.type, id: orig.id });
    }
  }

  for (const row of newRows) {
    if (row.id) {
      const orig = originalRows.find((o) => o.id === row.id);
      if (!orig) continue;
      const childOps: Op[] = [];
      const patch = buildPatchInternal(
        model,
        fieldDef.type,
        orig,
        row,
        row.id,
        childOps,
        newId
      );
      if (Object.keys(patch).length > 0) {
        ops.push({ kind: "update", type: fieldDef.type, id: row.id, patch });
      }
      ops.push(...childOps);
    } else {
      if (parentId == null) {
        throw new Error(
          `use-graphile: cannot create '${fieldDef.type}' without a parentId — provide BuildOptions.rootId or ensure the parent has an id`
        );
      }
      const id = newId();
      const childOps: Op[] = [];
      const input = buildPatchInternal(
        model,
        fieldDef.type,
        {},
        row,
        id,
        childOps,
        newId
      );
      ops.push({
        kind: "create",
        type: fieldDef.type,
        id,
        input: { ...input, id, [fk]: parentId },
      });
      ops.push(...childOps);
    }
  }
};
