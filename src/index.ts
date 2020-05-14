import { useState, useEffect } from "react";
import { Operations, buildOps } from "./fields";

export { Model } from "./model";
export { buildPatch } from "./patch/patch";

export type Form<T> = {
  values: T;
  clean: boolean;
} & Operations<T>;

export const useForm = <T = any>(initialValues: T = {} as T) => {
  const [values, setValues] = useState<T>(initialValues);
  useEffect(() => setValues(initialValues), [JSON.stringify(initialValues)]);

  const handleChange = (key: string, value: any) =>
    setValues({ ...values, [key]: value });

  const g: Form<T> = {
    values,
    clean: JSON.stringify(initialValues) === JSON.stringify(values),
    ...buildOps<T>(values, initialValues, setValues, handleChange),
  };

  return g;
};
