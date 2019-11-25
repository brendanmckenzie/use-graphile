import React from "react";
import { buildOps, Operations } from ".";
import { sorted } from "../util";

export type MultiFieldItem<T> = {
  remove: () => void;
  item: T;
} & Operations;

export type MultiField<T> = {
  items: any[];
  add: () => void;
  reset: () => void;
  renderItems: (
    render: (i: MultiFieldItem<T>) => any,
    sortBy: string | null
  ) => any;
};

export type RenderMultiField<T> = (m: MultiField<T>) => any;

export const multi = <T>(
  key: string,
  value: any,
  initialValue: any,
  onChange: (key: string, value: any) => void,
  render: RenderMultiField<T>
) => {
  // for multi-link fields
  const items = (value || {}).nodes || [];
  const initialItems = (initialValue || {}).nodes || [];

  const m: MultiField<T> = {
    items,
    add: () => {
      onChange(key, { nodes: [...items, {}] });
    },
    reset: () => {
      onChange(key, initialValue);
    },
    renderItems: (
      render: (i: MultiFieldItem<T>) => any,
      sortBy: string | null = null
    ) => {
      let sortedItems = sorted(items, sortBy);
      let sortedInitialItems = sorted(initialItems, sortBy);

      return sortedItems.map((item: any, index: number) => {
        const handleChange = (itemKey: string, itemValue: any) => {
          onChange(key, {
            nodes: sortedItems.map((ent: any, i: number) => {
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
          item,
          remove: () => {
            onChange(key, {
              nodes: sortedItems.filter((_: any, i: number) => i !== index)
            });
          },
          ...buildOps(
            sortedItems[index],
            sortedInitialItems[index],
            values =>
              onChange(key, {
                nodes: sortedItems.map((ent: any, i: number) =>
                  i === index ? values || {} : ent
                )
              }),
            handleChange
          )
        };

        return React.createElement(React.Fragment, {
          key: index,
          children: render(i)
        });
      });
    }
  };

  return render(m);
};
