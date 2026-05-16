import { useState } from "react";
import { Operations, buildOps } from "./fields";

export { Model, FieldDef } from "./model";
export {
  buildOperations,
  composeMutation,
  Op,
  CreateOp,
  UpdateOp,
  DeleteOp,
  SavePlan,
  MutationRegistry,
  EntityMutationConfig,
  BuildOptions,
  ComposeOptions,
  ComposedMutation,
} from "./operations";

export type Form<T> = {
  values: T;
  clean: boolean;
} & Operations<T>;

export const useForm = <T = any>(initialValues: T = {} as T) => {
  const [values, setValues] = useState<T>(initialValues);

  const handleChange = (key: string, value: any) =>
    setValues(prev => ({ ...prev, [key]: value }));

  const g: Form<T> = {
    values,
    clean: JSON.stringify(initialValues) === JSON.stringify(values),
    ...buildOps<T>(values, initialValues, setValues, handleChange),
  };

  return g;
};
