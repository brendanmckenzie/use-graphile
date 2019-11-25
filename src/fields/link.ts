import { Operations, buildOps } from ".";

export type LinkField<T> = {
  onChange: (newValue: any) => void;
  initialValue: any;
  value: T;
} & Operations;

export type RenderLinkField<T> = (l: LinkField<T>) => any;

export const link = <T>(
  key: string,
  value: any,
  initialValue: any,
  onChange: (key: string, value: any) => void,
  render: RenderLinkField<T>
) => {
  const l: LinkField<T> = {
    onChange: (newValue: any) => onChange(key, newValue),
    value,
    initialValue,
    ...buildOps(
      value,
      initialValue,
      values => onChange(key, values),
      (itemKey, itemValue) => onChange(key, { ...value, [itemKey]: itemValue })
    )
  };

  return render(l);
};
