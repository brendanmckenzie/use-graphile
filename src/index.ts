import { useState, useEffect } from "react";
import { buildPatch } from "./patch/patch";
import { Operations, buildOps } from "./fields";
import { Model } from "./model";

export type Model = Model;

type Graphile = {
  values: any;
  patch: any;
  clean: boolean;
} & Operations;

const useGraphile = (
  model: Model,
  rootType: string,
  initialValues: any = {}
) => {
  const [values, setValues] = useState<any>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = (key: string, value: any) =>
    setValues({ ...values, [key]: value });

  const patch = buildPatch(model, rootType, initialValues, values);

  const g: Graphile = {
    values,
    patch,
    clean: Object.keys(patch).length === 0,
    ...buildOps(values, initialValues, setValues, handleChange)
  };

  return g;
};

export default useGraphile;
