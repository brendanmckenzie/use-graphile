import { input, InputProps } from "./input";
import { textarea, TextAreaProps } from "./textarea";
import { link, RenderLinkField } from "./link";
import { multi, RenderMultiField, MultiFieldOptions } from "./multi";
import { select, SelectOptions, SelectProps } from "./select";
import { checkbox } from "./checkbox";
import { radio } from "./radio";

export interface Operations<T = any> {
  reset: () => void;
  set: (values: T) => void;
  input: (key: keyof T) => InputProps;
  checkbox: (key: keyof T) => InputProps;
  radio: (key: keyof T, itemValue: any) => InputProps;
  textarea: (key: keyof T) => TextAreaProps;
  link: <TEntity = any>(key: keyof T, render: RenderLinkField<TEntity>) => any;
  multi: <TEntity = any>(
    key: keyof T,
    render: RenderMultiField<TEntity>,
    options?: MultiFieldOptions<TEntity>
  ) => any;
  select: <TOption = any>(
    key: keyof T,
    options?: SelectOptions<TOption>
  ) => SelectProps;
  display: (key: keyof T) => any;
}

export const buildOps = <T = any>(
  values: T,
  initialValues: T,
  setValues: (values: T) => void,
  handleChange: (key: string, value: any) => void
): Operations<T> => {
  const safeValues = values || ({} as T);
  const safeInitialValues = initialValues || ({} as T);
  return {
    reset: () => setValues(initialValues),
    set: (values: any) => setValues(values),
    display: (key: keyof T): any => safeValues[key],
    input: (key: keyof T): InputProps =>
      input(
        key as string,
        safeValues[key],
        safeInitialValues[key],
        handleChange
      ),
    checkbox: (key: keyof T): InputProps =>
      checkbox(
        key as string,
        safeValues[key],
        safeInitialValues[key],
        handleChange
      ),
    radio: (key: keyof T, itemValue: any): InputProps =>
      radio(
        key as string,
        safeValues[key],
        itemValue,
        safeInitialValues[key],
        handleChange
      ),
    textarea: (key: keyof T): TextAreaProps =>
      textarea(
        key as string,
        safeValues[key],
        safeInitialValues[key],
        handleChange
      ),
    link: <TEntity = any>(key: keyof T, render: RenderLinkField<TEntity>) =>
      link<TEntity>(
        key as string,
        safeValues[key],
        safeInitialValues[key],
        handleChange,
        render
      ),
    multi: <TEntity = any>(
      key: keyof T,
      render: RenderMultiField<TEntity>,
      options?: MultiFieldOptions<TEntity>
    ) =>
      multi<TEntity>(
        key as string,
        safeValues[key],
        safeInitialValues[key],
        handleChange,
        render,
        options
      ),
    select: <TOption = any>(key: keyof T, options?: SelectOptions<TOption>) =>
      select<TOption>(
        key as string,
        safeValues[key],
        safeInitialValues[key],
        handleChange,
        options
      ),
  } as Operations<T>;
};
