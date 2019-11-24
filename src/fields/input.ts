import React from "react";

export type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export const input = (
  key: string,
  value: any,
  initialValue: any,
  onChange: (key: string, value: any) => void,
  checkbox: boolean
): InputProps => {
  if (checkbox) {
    return {
      type: "checkbox",
      checked: !!value,
      onChange: ev => onChange(key, ev.currentTarget.checked)
    };
  }
  return {
    name: key,
    value: value || "",
    onChange: ev =>
      onChange(
        key,
        checkbox ? ev.currentTarget.checked : ev.currentTarget.value
      )
  };
};
