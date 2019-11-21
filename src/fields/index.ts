import { input, InputProps } from "./input";
import { link, RenderLinkField } from "./link";
import { multi, RenderMultiField } from "./multi";

export type Operations = {
  reset: () => void;
  input: (key: string) => InputProps;
  link: (key: string, render: RenderLinkField) => any;
  multi: (key: string, render: RenderMultiField) => any;
};

export const buildOps = (
  values: any,
  initialValues: any,
  setValues: (values: any) => void,
  handleChange: (key: string, value: any) => void
): Operations => {
  const safeValues = values || {};
  const safeInitialValues = initialValues || {};
  return {
    reset: () => setValues(initialValues),
    input: (key: string): InputProps =>
      input(key, safeValues[key], safeInitialValues[key], handleChange),
    link: (key: string, render: RenderLinkField) =>
      link(key, safeValues[key], safeInitialValues[key], handleChange, render),
    multi: (key: string, render: RenderMultiField) =>
      multi(key, safeValues[key], safeInitialValues[key], handleChange, render)
  };
};
