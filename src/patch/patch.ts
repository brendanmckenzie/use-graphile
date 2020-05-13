import { patchMulti } from "./patchMulti";
import { patchLink } from "./patchLink";
import { Model, FieldDef } from "../model";

const parseValue = (type: string, value: any) => {
  switch (type) {
    case "number":
      if (typeof value === "number") {
        return value;
      }
      return parseFloat(value);
    case "string[]":
      return (value || "")
        .split(",")
        .filter((a: any) => !!a)
        .map((a: any) => a.trim());
    case "boolean":
      return value ?? false;
    case "date":
    case "string":
    default:
      return value ? value : null;
  }
};

export const buildPatch = (
  config: Model,
  type: string,
  originalValues: any,
  newValues: any
): any => {
  const typeDef = config[type];
  if (!typeDef) {
    console.warn(`Unknown type: '${type}`);
    return {};
  }
  const fields = Object.keys(typeDef);

  return fields.reduce((p: any, key) => {
    const fieldDef = typeDef[key];
    const originalVal = originalValues[key];
    const newVal = newValues[key];

    const type = typeof fieldDef === "string" ? fieldDef : fieldDef.type;
    const multi = typeof fieldDef === "string" ? false : fieldDef.multi;

    if (type && multi) {
      // link multi field
      return {
        ...p,
        ...patchMulti(config, fieldDef as FieldDef, originalVal, newVal),
      };
    } else if (config[type]) {
      // link field
      return {
        ...p,
        ...patchLink(config, fieldDef as FieldDef, originalVal, newVal),
      };
    } else {
      // standard field
      if (originalValues[key] === newValues[key]) {
        return p;
      } else {
        if (newValues[key] !== undefined || originalValues[key]) {
          return {
            ...p,
            [key]: parseValue(type, newValues[key]),
          };
        }
      }
    }

    return p;
  }, {});
};
