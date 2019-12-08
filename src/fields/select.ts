import React from "react";

export type SelectProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>;

export type SelectOptions<T, TOption = any> = {
  list: TOption[];
  valueKey?: (item: TOption) => any;
  displayKey?: (item: TOption) => string;
};

export const select = <T, TOption = any>(
  key: string,
  value: any,
  initialValue: any,
  onChange: (key: string, value: any) => void,
  options: SelectOptions<T, TOption>
): SelectProps => {
  return {
    value: value || "",
    onChange: (ev: React.ChangeEvent<HTMLSelectElement>) =>
      onChange(key, ev.currentTarget.value),
    children: options.list.map((ent: any, index: number) =>
      React.createElement("option", {
        key: index,
        value: options.valueKey ? options.valueKey(ent) : ent,
        children: options.displayKey ? options.displayKey(ent) : ent
      })
    )
  };
};
