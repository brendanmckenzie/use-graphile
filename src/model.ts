export type FieldDef = {
  type: "string" | "number" | "date" | "datetime" | string;
  multi?: boolean;
  patchProperty?: string;
  linkedObject?: boolean;
};

export type Model = {
  [typeKey: string]: { [fieldKey: string]: FieldDef | string };
};
