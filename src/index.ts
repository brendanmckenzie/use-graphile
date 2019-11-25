import { useState, useEffect } from "react";
import isEqual from "lodash.isequal";
import { buildPatch } from "./patch/patch";
import { Operations, buildOps } from "./fields";
import { Model } from "./model";

export type Model = Model;

export type Graphile = {
  values: any;
  buildPatch: () => any;
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

  const g: Graphile = {
    values,
    buildPatch: () => buildPatch(model, rootType, initialValues, values),
    clean: isEqual(initialValues, values),
    ...buildOps(values, initialValues, setValues, handleChange)
  };

  return g;
};

export default useGraphile;
