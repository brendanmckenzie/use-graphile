import { Op, SavePlan, MutationRegistry } from "./types";

export type ComposeOptions = {
  /** Type name of the root entity (must be a key of the model). */
  rootType: string;
  /** Whether the root mutation is an update or a create. */
  rootKind: "update" | "create";
  /** Existing id for update; required for both kinds (use a generated id for create). */
  rootId: string;
  plan: SavePlan;
  registry: MutationRegistry;
  /** GraphQL operation name; defaults to "Save". */
  mutationName?: string;
  /** Selection set rendered for every mutation result. Default: "{ clientMutationId }". */
  defaultSelection?: string;
};

export type ComposedMutation = {
  document: string;
  variables: Record<string, any>;
};

const requireEntry = (registry: MutationRegistry, type: string) => {
  const entry = registry[type];
  if (!entry) {
    throw new Error(`use-graphile: no MutationRegistry entry for type '${type}'`);
  }
  return entry;
};

/**
 * Compose a single GraphQL mutation document that executes the root mutation
 * followed by all child ops. Returns the document text and matching variables
 * object.
 *
 * When paired with a server that runs the whole operation in one Postgres
 * transaction (e.g. via SingleTransactionPlugin in PostGraphile v5), this
 * provides true atomicity across the parent + child writes.
 */
export const composeMutation = (opts: ComposeOptions): ComposedMutation => {
  const {
    rootType,
    rootKind,
    rootId,
    plan,
    registry,
    mutationName = "Save",
    defaultSelection = "{ clientMutationId }",
  } = opts;

  const rootEntry = requireEntry(registry, rootType);
  const varDefs: string[] = [];
  const fields: string[] = [];
  const variables: Record<string, any> = {};

  // Root
  if (rootKind === "update") {
    if (!rootEntry.update) {
      throw new Error(
        `use-graphile: registry for '${rootType}' has no 'update' entry`
      );
    }
    varDefs.push(`$rootId: UUID!`);
    varDefs.push(`$rootPatch: ${rootEntry.update.patchType}!`);
    variables.rootId = rootId;
    variables.rootPatch = plan.patch;
    fields.push(
      `  root: ${rootEntry.update.mutation}(input: { id: $rootId, patch: $rootPatch }) ${defaultSelection}`
    );
  } else {
    if (!rootEntry.create) {
      throw new Error(
        `use-graphile: registry for '${rootType}' has no 'create' entry`
      );
    }
    const { mutation, inputKey, inputType } = rootEntry.create;
    varDefs.push(`$rootInput: ${inputType}!`);
    variables.rootInput = { ...plan.patch, id: rootId };
    fields.push(
      `  root: ${mutation}(input: { ${inputKey}: $rootInput }) ${defaultSelection}`
    );
  }

  // Child ops
  plan.ops.forEach((op, i) => {
    const entry = requireEntry(registry, op.type);
    const alias = aliasFor(op, i);
    switch (op.kind) {
      case "create": {
        if (!entry.create) {
          throw new Error(
            `use-graphile: registry for '${op.type}' has no 'create' entry`
          );
        }
        const { mutation, inputKey, inputType } = entry.create;
        const varName = `${alias}_input`;
        varDefs.push(`$${varName}: ${inputType}!`);
        variables[varName] = op.input;
        fields.push(
          `  ${alias}: ${mutation}(input: { ${inputKey}: $${varName} }) ${defaultSelection}`
        );
        break;
      }
      case "update": {
        if (!entry.update) {
          throw new Error(
            `use-graphile: registry for '${op.type}' has no 'update' entry`
          );
        }
        const idVar = `${alias}_id`;
        const patchVar = `${alias}_patch`;
        varDefs.push(`$${idVar}: UUID!`);
        varDefs.push(`$${patchVar}: ${entry.update.patchType}!`);
        variables[idVar] = op.id;
        variables[patchVar] = op.patch;
        fields.push(
          `  ${alias}: ${entry.update.mutation}(input: { id: $${idVar}, patch: $${patchVar} }) ${defaultSelection}`
        );
        break;
      }
      case "delete": {
        if (!entry.delete) {
          throw new Error(
            `use-graphile: registry for '${op.type}' has no 'delete' entry`
          );
        }
        const idVar = `${alias}_id`;
        varDefs.push(`$${idVar}: UUID!`);
        variables[idVar] = op.id;
        fields.push(
          `  ${alias}: ${entry.delete.mutation}(input: { id: $${idVar} }) ${defaultSelection}`
        );
        break;
      }
    }
  });

  const document =
    `mutation ${mutationName}(${varDefs.join(", ")}) {\n` +
    fields.join("\n") +
    `\n}`;
  return { document, variables };
};

const aliasFor = (op: Op, i: number): string => {
  const prefix = op.kind === "create" ? "c" : op.kind === "update" ? "u" : "d";
  return `${prefix}${i}`;
};
