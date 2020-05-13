import React from "react";
import { buildOps, Operations } from ".";
import { sorted } from "../util";

export type MultiFieldItem<T> = {
  remove: () => void;
  item: T;
  index: number;
} & Operations<T>;

export type MultiField<T> = {
  items: T[];
  add: () => void;
  reset: () => void;
  set: (value: T[]) => void;
  renderItems: (render: (i: MultiFieldItem<T>) => any, sortBy?: string) => any;
};

export type MultiFieldOptions<T> = {
  populateNewItem?: (items: T[]) => T;
};

export type RenderMultiField<T> = (m: MultiField<T>) => any;

export const multi = <T>(
  key: string,
  value: any,
  initialValue: any,
  onChange: (key: string, value: any) => void,
  render: RenderMultiField<T>,
  options?: MultiFieldOptions<T>
) => {
  // for multi-link fields
  const items: T[] = (value || {}).nodes || [];
  const initialItems = (initialValue || {}).nodes || [];

  const m: MultiField<T> = {
    items,
    add: () => {
      if (options && options.populateNewItem) {
        onChange(key, { nodes: [...items, options.populateNewItem(items)] });
      } else {
        onChange(key, { nodes: [...items, {}] });
      }
    },
    reset: () => onChange(key, initialValue),
    set: (value: T[]) => onChange(key, { nodes: value }),
    renderItems: (
      render: (i: MultiFieldItem<T>) => any,
      sortBy: string | null = null
    ) => {
      const sortedItems = sorted(items, sortBy);
      const sortedInitialItems = sorted(initialItems, sortBy);

      return sortedItems.map((item: any, index: number) => {
        const handleChange = (itemKey: string, itemValue: any) => {
          onChange(key, {
            nodes: sortedItems.map((ent, i) => {
              if (i === index) {
                return {
                  ...ent,
                  [itemKey]: itemValue
                };
              }
              return ent;
            })
          });
        };
        const i: MultiFieldItem<T> = {
          index,
          item,
          remove: () => {
            onChange(key, {
              nodes: sortedItems.filter((_, i) => i !== index)
            });
          },
          ...buildOps<T>(
            sortedItems[index],
            sortedInitialItems[index],
            values =>
              onChange(key, {
                nodes: sortedItems.map((ent, i) =>
                  i === index ? values || {} : ent
                )
              }),
            handleChange
          )
        };

        return React.createElement(React.Fragment, {
          key: item.id || index,
          children: render(i)
        });
      });
    }
  };

  return render(m);
};
