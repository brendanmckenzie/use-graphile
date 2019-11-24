import { InputProps } from "./input";

export const checkbox = (
  key: string,
  value: any,
  initialValue: any,
  onChange: (key: string, value: any) => void
): InputProps => {
  return {
    name: key,
    type: "checkbox",
    checked: !!value,
    onChange: ev => onChange(key, ev.currentTarget.checked)
  };
};
