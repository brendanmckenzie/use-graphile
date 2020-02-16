import { buildPatch } from "./patch";
import { FieldDef, Model } from "../model";

export const patchLink = (
  config: Model,
  fieldDef: FieldDef,
  originalVal: any,
  newVal: any
) => {
  if (!fieldDef.patchProperty) {
    return {};
  }

  if (originalVal && newVal && originalVal.id === newVal.id) {
    // updateById... maybe
    const patch = buildPatch(config, fieldDef.type, originalVal, newVal);

    if (Object.keys(patch).length === 0) {
      return {};
    } else {
      if (fieldDef.linkedObject) {
        const { __typename, ...val } = newVal;
        return {
          [fieldDef.patchProperty]: val
        };
      }
      return {
        [fieldDef.patchProperty]: {
          updateById: {
            id: newVal.id,
            patch
          }
        }
      };
    }
  } else if (originalVal && newVal && originalVal.id !== newVal.id) {
    // connectById
    if (fieldDef.patchWorkaroundProperty) {
      return {
        [fieldDef.patchWorkaroundProperty]: newVal.id
      };
    }
    return {
      [fieldDef.patchProperty]: {
        connectById: {
          id: newVal.id
        }
      }
    };
  } else if (originalVal && !newVal) {
    // deleteById
    if (fieldDef.patchWorkaroundProperty) {
      return {
        [fieldDef.patchWorkaroundProperty]: null
      };
    }
  return {
      [fieldDef.patchProperty]: {
        deleteById: {
          id: originalVal.id
        }
      }
    };
  } else if (!originalVal && newVal) {
    if (newVal.id) {
      // connectById
      if (fieldDef.patchWorkaroundProperty) {
        return {
          [fieldDef.patchWorkaroundProperty]: newVal.id
        };
      }
      return {
        [fieldDef.patchProperty]: {
          connectById: {
            id: newVal.id
          }
        }
      };
    } else {
      if (fieldDef.linkedObject) {
        return {
          [fieldDef.patchProperty]: newVal
        };
      }
      // create
      return {
        [fieldDef.patchProperty]: {
          create: newVal
        }
      };
    }
  }
};
