import React from "react";

export type InputProps = {
  value?: any;
  checked?: boolean;
  onChange: (
    ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

export const input = (
  key: string,
  value: any,
  initialValue: any,
  onChange: (key: string, value: any) => void,
  checkbox: boolean
): InputProps => {
  if (checkbox) {
    return {
      checked: !!value,
      onChange: (
        ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => onChange(key, (ev.currentTarget as HTMLInputElement).checked)
    };
  }
  return {
    value: value || "",
    onChange: (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(
        key,
        checkbox
          ? (ev.currentTarget as HTMLInputElement).checked
          : ev.currentTarget.value
      )
  };
};
