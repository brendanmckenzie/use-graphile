import React, { useState } from "react";

export type SelectProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>;

export type SelectOptions<T> = {
  list?: T[];
  listAsync?: () => Promise<T[]>;
  valueKey: (item: T) => string;
  displayKey: (item: T) => string;
};

export const select = <T>(
  key: string,
  value: any,
  initialValue: any,
  onChange: (key: string, value: any) => void,
  options: SelectOptions<T>
): SelectProps => {
  const [list, setList] = useState<any[]>([]);

  if (options.list) {
    setList(options.list);
  } else if (options.listAsync) {
    options.listAsync().then(setList);
  }

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
