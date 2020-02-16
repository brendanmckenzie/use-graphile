export type FieldDef = {
  type: "string" | "number" | "date" | "datetime" | string;
  multi?: boolean;
  patchProperty?: string;
  linkedObject?: boolean;
  patchWorkaroundProperty?: string; // See: https://github.com/mlipscombe/postgraphile-plugin-nested-mutations/issues/29
};

export type Model = {
  [typeKey: string]: { [fieldKey: string]: FieldDef | string };
};
