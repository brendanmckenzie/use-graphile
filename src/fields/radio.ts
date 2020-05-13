import { InputProps } from "./input";

export const radio = (
  key: string,
  value: any,
  itemValue: any,
  initialValue: any,
  onChange: (key: string, value: any) => void
): InputProps => {
  return {
    name: key,
    type: "radio",
    value: itemValue,
    checked: value === itemValue,
    onChange: (ev) => onChange(key, ev.currentTarget.value),
  };
};
