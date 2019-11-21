import { Operations, buildOps } from ".";

export type LinkField = {
  onChange: (newValue: any) => void;
  initialValue: any;
  value: any;
} & Operations;

export type RenderLinkField = (l: LinkField) => any;

export const link = (
  key: string,
  value: any,
  initialValue: any,
  onChange: (key: string, value: any) => void,
  render: RenderLinkField
) => {
  const l: LinkField = {
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
