import React from "react";

export type TextAreaProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
>;

export const textarea = (
  key: string,
  value: any,
  initialValue: any,
  onChange: (key: string, value: any) => void
): TextAreaProps => {
  return {
    name: key,
    value: value || "",
    onChange: ev => onChange(key, ev.currentTarget.value)
  };
};
