import { input, InputProps } from "./input";
import { textarea, TextAreaProps } from "./textarea";
import { link, RenderLinkField } from "./link";
import { multi, RenderMultiField } from "./multi";
import { select, SelectOptions } from "./select";
import { checkbox } from "./checkbox";

export type Operations = {
  reset: () => void;
  input: (key: string) => InputProps;
  checkbox: (key: string) => InputProps;
  textarea: (key: string) => TextAreaProps;
  link: <T = any>(key: string, render: RenderLinkField<T>) => any;
  multi: <T = any>(key: string, render: RenderMultiField<T>) => any;
  select: <T = any>(key: string, options: SelectOptions<T>) => any;
  display: (key: string) => any;
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
    display: (key: string): any => safeValues[key],
    input: (key: string): InputProps =>
      input(key, safeValues[key], safeInitialValues[key], handleChange),
    checkbox: (key: string): InputProps =>
      checkbox(key, safeValues[key], safeInitialValues[key], handleChange),
    textarea: (key: string): TextAreaProps =>
      textarea(key, safeValues[key], safeInitialValues[key], handleChange),
    link: <T = any>(key: string, render: RenderLinkField<T>) =>
      link<T>(
        key,
        safeValues[key],
        safeInitialValues[key],
        handleChange,
        render
      ),
    multi: <T = any>(key: string, render: RenderMultiField<T>) =>
      multi<T>(
        key,
        safeValues[key],
        safeInitialValues[key],
        handleChange,
        render
      ),
    select: <T = any>(key: string, options: SelectOptions<T>) =>
      select<T>(
        key,
        safeValues[key],
        safeInitialValues[key],
        handleChange,
        options
      )
  };
};
