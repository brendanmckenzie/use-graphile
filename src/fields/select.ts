import React, { useState, useEffect } from "react";

export type SelectProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>;

export type SelectOptions<T, TOption = any> = {
  list?: TOption[];
  listAsync?: () => Promise<TOption[]>;
  valueKey: (item: TOption) => any;
  displayKey: (item: TOption) => string;
};

export const select = <T, TOption = any>(
  key: string,
  value: any,
  initialValue: any,
  onChange: (key: string, value: any) => void,
  options: SelectOptions<T, TOption>
): SelectProps => {
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    if (options.list) {
      setList(options.list);
    } else if (options.listAsync) {
      options.listAsync().then(setList);
    }
  }, [options.list, options.listAsync]);

  return {
    value: value || "",
    onChange: (ev: React.ChangeEvent<HTMLSelectElement>) =>
      onChange(key, ev.currentTarget.value),
    children: list.map((ent: any, index: number) =>
      React.createElement("option", {
        key: index,
        value: options.valueKey(ent),
        children: options.displayKey(ent)
      })
    )
  };
};
