export const sorted = <T = any>(input: T[], sortBy: string | null): T[] => {
  if (sortBy) {
    const [field, direction] = sortBy.split(" ");
    let sortedItems = (input as Array<any>).sort((a, b) => {
      const aType = typeof a[field];
      const bType = typeof b[field];
      if (aType === bType) {
        switch (aType) {
          case "number":
            return a[field] - b[field];
          case "string":
            return a[field].localeCompare(b[field]);
        }
      }
      return 0;
    });

    if (direction === "desc") {
      sortedItems = sortedItems.reverse();
    }

    return sortedItems;
  }

  return input;
};
