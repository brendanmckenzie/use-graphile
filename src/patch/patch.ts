import { patchMulti } from "./patchMulti";
import { patchLink } from "./patchLink";
import { Model } from "../model";

const parseValue = (type: string, value: any) => {
  switch (type) {
    case "number":
      return parseFloat(value);
    case "string":
    default:
      return value;
  }
};

export const buildPatch = (
  config: Model,
  type: string,
  originalValues: any,
  newValues: any
): any => {
  const typeDef = config[type];
  const fields = Object.keys(typeDef);
  return fields.reduce((p: any, key) => {
    const fieldDef = typeDef[key];
    const originalVal = originalValues[key];
    const newVal = newValues[key];

    if (fieldDef.type && fieldDef.multi) {
      // link multi field
      return { ...p, ...patchMulti(config, fieldDef, originalVal, newVal) };
    } else if (typeDef[fieldDef.type]) {
      // link field
      return { ...p, ...patchLink(config, fieldDef, originalVal, newVal) };
    } else {
      // standard field
      if (originalValues[key] === newValues[key]) {
        return p;
      } else {
        if (newValues[key] || originalValues[key]) {
          return {
            ...p,
            [key]: parseValue(fieldDef.type, newValues[key])
          };
        }
      }
    }

    return p;
  }, {});
};
