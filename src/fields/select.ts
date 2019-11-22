import React, { useState } from "react";

export type SelectProps = {
  value?: any;
  onChange: (ev: React.ChangeEvent<HTMLSelectElement>) => void;
  children: any[];
};

export type SelectOptions = {
  list?: any[];
  listAsync?: () => Promise<any[]>;
  valueKey: string;
  displayKey: string;
};

export const select = (
  key: string,
  value: any,
  initialValue: any,
  onChange: (key: string, value: any) => void,
  options: SelectOptions
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
        value: ent[options.valueKey],
        children: ent[options.displayKey]
      })
    )
  };
};
