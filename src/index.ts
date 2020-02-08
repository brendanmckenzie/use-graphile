import { useState, useEffect } from "react";
import isEqual from "lodash.isequal";
import { buildPatch } from "./patch/patch";
import { Operations, buildOps } from "./fields";
import { Model } from "./model";
export { Model } from "./model";

export type Graphile<T> = {
  values: T;
  buildPatch: () => any;
  clean: boolean;
} & Operations<T>;

const useGraphile = <T = any>(
  model: Model,
  rootType: string,
  initialValues: T
) => {
  const [values, setValues] = useState<T>(initialValues);

  useEffect(() => setValues(initialValues), [JSON.stringify(initialValues)]);

  const handleChange = (key: string, value: any) =>
    setValues({ ...values, [key]: value });

  const g: Graphile<T> = {
    values,
    buildPatch: () => buildPatch(model, rootType, initialValues, values),
    clean: isEqual(initialValues, values),
    ...buildOps<T>(values, initialValues, setValues, handleChange)
  };

  return g;
};

export default useGraphile;
