import React from "react";

export type InputProps = {
  value: any;
  reset: () => void;
  onChange: (
    ev: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
};

export const input = (
  key: string,
  value: any,
  initialValue: any,
  onChange: (key: string, value: any) => void
): InputProps => {
  return {
    value: value || "",
    reset: () => onChange(key, initialValue),
    onChange: (
      ev: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      onChange(key, ev.currentTarget.value);
    }
  };
};
