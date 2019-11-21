import { buildPatch } from "./patch";
import { Model, FieldDef } from "../model";

export const patchMulti = (
  config: Model,
  fieldDef: FieldDef,
  originalVal: any,
  newVal: any
) => {
  if (!fieldDef.patchProperty) {
    return {};
  }

  const originalValSafe = (originalVal || {}).nodes || [];
  const newValSafe = (newVal || {}).nodes || [];

  const create = newValSafe
    .filter((ent: any) => !ent.id)
    .map((ent: any) => buildPatch(config, fieldDef.type, {}, ent))
    .filter((ent: any) => Object.keys(ent).length > 0);

  const deleteById = originalValSafe
    .filter((orig: any) => !newValSafe.find((n: any) => n.id === orig.id))
    .map((ent: any) => ({ id: ent.id }));

  const updateById = newValSafe
    .map((n: any) => ({
      n,
      o: originalValSafe.find((o: any) => o.id === n.id)
    }))
    .filter((ent: any) => ent.o)
    .map((ent: any) => {
      const patch = buildPatch(config, fieldDef.type, ent.o, ent.n);
      if (Object.keys(patch).length === 0) {
        return null;
      }
      return {
        id: ent.o.id,
        patch: buildPatch(config, fieldDef.type, ent.o, ent.n)
      };
    })
    .filter((ent: any) => ent);

  if (create.length + deleteById.length + updateById.length === 0) {
    // no updates
    return {};
  }

  const ops: any = { create, deleteById, updateById };

  return {
    [fieldDef.patchProperty]: Object.keys(ops)
      .map((k: string) => ({
        [k]: ops[k].length > 0 ? ops[k] : null
      }))
      .filter((ent: any) => ent[Object.keys(ent)[0]] !== null)
      .reduce((p: any, c: any) => ({ ...p, ...c }), {})
  };
};
