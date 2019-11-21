export type FieldDef = {
  type: "string" | "number" | "date" | "datetime" | string;
  multi?: boolean;
  patchProperty?: string;
};

export type Model = { [typeKey: string]: { [fieldKey: string]: FieldDef } };
