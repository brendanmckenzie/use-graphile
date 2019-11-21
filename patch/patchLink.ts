import { buildPatch } from "./patch";

export const patchLink = (
  config: any,
  fieldDef: any,
  originalVal: any,
  newVal: any
) => {
  if (originalVal && newVal && originalVal.id === newVal.id) {
    // updateById... maybe
    const patch = buildPatch(config, fieldDef.type, originalVal, newVal);

    if (Object.keys(patch).length === 0) {
      return {};
    } else {
      return {
        [fieldDef.patchProperty]: {
          updateById: {
            id: newVal.id,
            patch: buildPatch(config, fieldDef.type, originalVal, newVal)
          }
        }
      };
    }
  } else if (originalVal && newVal && originalVal.id !== newVal.id) {
    // connectById
    return {
      [fieldDef.patchProperty]: {
        connectById: {
          id: newVal.id
        }
      }
    };
  } else if (originalVal && !newVal) {
    // deleteById
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
      return {
        [fieldDef.patchProperty]: {
          connectById: {
            id: newVal.id
          }
        }
      };
    } else {
      // create
      return {
        [fieldDef.patchProperty]: {
          create: newVal
        }
      };
    }
  }
};
