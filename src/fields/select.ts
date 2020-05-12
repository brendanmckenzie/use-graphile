import * as React from "react";

export type SelectProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>;

export type SelectOptions<TOption = any> = {
  list?: TOption[];
  valueKey?: (item: TOption) => any;
  displayKey?: (item: TOption) => string;
  translate?: (value: string) => any;
  includeEmpty?: boolean;
};

const defaultTranslate = (value: string) => value;

export const select = <TOption = any>(
  key: string,
  value: any,
  initialValue: any,
  onChange: (key: string, value: any) => void,
  options?: SelectOptions<TOption>
): SelectProps => {
  return {
    value: value || "",
    onChange: (ev: React.ChangeEvent<HTMLSelectElement>) => {
      const value = (options?.translate || defaultTranslate)(
        ev.currentTarget.value
      );
      onChange(key, value ? value : null);
    },
    children: (options?.includeEmpty
      ? [
          React.createElement("option", {
            key: -1,
            value: "(select)",
            children: null
          })
        ]
      : []
    ).concat(
      (options?.list ?? []).map((ent: any, index: number) =>
        React.createElement("option", {
          key: index,
          value: options?.valueKey ? options.valueKey(ent) : ent,
          children: options?.displayKey ? options.displayKey(ent) : ent
        })
      )
    )
  };
};
