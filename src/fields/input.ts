import React from "react";

export type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export const input = (
  key: string,
  value: any,
  initialValue: any,
  onChange: (key: string, value: any) => void
): InputProps => {
  return {
    name: key,
    value: value || "",
    onChange: ev => onChange(key, ev.currentTarget.value)
  };
};
