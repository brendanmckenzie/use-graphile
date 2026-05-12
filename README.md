# use-graphile

A React form-state hook and patch/operation builder for PostGraphile-backed apps.

There are two halves:

1. **Form handling** — `useForm` returns a small API for binding inputs, links, and lists to local React state.
2. **Operation building** — `buildOperations` diffs original vs. edited values against a model and produces a flat root patch plus an ordered list of child operations. `composeMutation` turns that into a single GraphQL document.

## PostGraphile v5 compatibility

> **v1.0 breaking change.** Earlier versions (`<= 0.x`) emitted v4-style nested mutation payloads (`tripFlightsUsingId: { create: [...] }`) via `buildPatch` and required [`postgraphile-plugin-nested-mutations`](https://github.com/mlipscombe/postgraphile-plugin-nested-mutations). That plugin has not been ported to PostGraphile v5 and the nested Patch input fields don't exist on a v5 schema.
>
> v1.0 replaces `buildPatch` with `buildOperations`, which emits a flat root patch (scalar columns + raw FK columns for forward links) and a list of sibling create/update/delete ops on child entities. `composeMutation` bundles them into one document with multiple top-level mutations.
>
> For atomicity across those sibling mutations, the server must run the operation in a single transaction. v5 does *not* do this by default (each step gets its own transaction). The companion plugin [`SingleTransactionPlugin`](https://github.com/brendanmckenzie/use-graphile/blob/main/docs/SingleTransactionPlugin.md) restores v4 semantics by checking out a single client per request and using savepoints for internal step transactions.

## Model

Declare the entities you want to track and the relations between them.

```ts
import { Model } from "use-graphile";

export const model: Model = {
  Trip: {
    name: { type: "string" },
    customer: { type: "Customer", foreignKey: "customerId" },
    tripFlights: { type: "TripFlight", multi: true, foreignKey: "tripId" },
  },
  TripFlight: {
    carrier: { type: "string" },
    number: { type: "string" },
    departure: { type: "datetime" },
    arrival: { type: "datetime" },
  },
  Customer: { name: { type: "string" } },
};
```

Field rules:

- **Scalar:** `{ type: "string" | "number" | "boolean" | "date" | "datetime" | "string[]" }`.
- **Forward link** (this entity holds the FK): `{ type: "<OtherType>", foreignKey: "<columnOnThis>" }`. Emits `patch[foreignKey] = newValue.id`.
- **Inverse many** (other entity holds the FK): `{ type: "<OtherType>", multi: true, foreignKey: "<columnOnOther>" }`. Each created child row gets `child[foreignKey] = parent.id`.

## Form handling (`useForm`)

```tsx
const g = useForm<Trip>(initialValues);

return (
  <form>
    <input {...g.input("name")} />

    {g.link<Customer>("customer", c => (
      <input {...c.input("name")} />
    ))}

    {g.multi<TripFlight>("tripFlights", flights => (
      <>
        {flights.renderItems(flight => (
          <>
            <input {...flight.input("carrier")} />
            <input {...flight.input("number")} />
            <button onClick={flight.remove}>Remove</button>
          </>
        ))}
        <button onClick={flights.add}>Add flight</button>
      </>
    ))}
  </form>
);
```

`g.input`, `g.checkbox`, `g.radio`, `g.textarea`, `g.select`, `g.link`, `g.multi`, `g.display` are all available. `multi` is pure client-side state: `add` appends a blank row, `remove` drops one, `renderItems` walks them. No GraphQL semantics leak in here.

## Building a save plan

When the user clicks Save:

```ts
import { buildOperations } from "use-graphile";

const plan = buildOperations(model, "Trip", initialValues, g.values, {
  rootId: initialValues.id,
});

// plan = {
//   patch: { name: "...", customerId: "..." },
//   ops: [
//     { kind: "delete", type: "TripFlight", id: "..." },
//     { kind: "update", type: "TripFlight", id: "...", patch: { number: "12" } },
//     { kind: "create", type: "TripFlight", id: "<new>", input: { tripId, carrier, ... } },
//   ],
// }
```

- `patch` contains only scalar diffs and forward FK columns. It can be fed straight into a v5 `update<Type>(input: { id, patch })` mutation.
- `ops` are returned in dependency order (deletes first, then updates, then creates). New rows get a client-generated UUID so grandchildren can reference them in the same atomic mutation document.

## Composing the GraphQL document

Provide a registry that maps each type name to the v5 mutation names it exposes.

```ts
import { composeMutation, MutationRegistry } from "use-graphile";

const registry: MutationRegistry = {
  Trip: {
    update: { mutation: "updateTrip", patchType: "TripPatch" },
    create: { mutation: "createTrip", inputKey: "trip", inputType: "TripInput" },
  },
  TripFlight: {
    create: { mutation: "createTripFlight", inputKey: "tripFlight", inputType: "TripFlightInput" },
    update: { mutation: "updateTripFlight", patchType: "TripFlightPatch" },
    delete: { mutation: "deleteTripFlight" },
  },
};

const { document, variables } = composeMutation({
  rootType: "Trip",
  rootKind: "update",
  rootId: initialValues.id,
  plan,
  registry,
});

await apolloClient.mutate({ mutation: gql(document), variables });
```

The generated document looks like:

```graphql
mutation Save(
  $rootId: UUID!, $rootPatch: TripPatch!,
  $d0_id: UUID!,
  $u1_id: UUID!, $u1_patch: TripFlightPatch!,
  $c2_input: TripFlightInput!
) {
  root: updateTrip(input: { id: $rootId, patch: $rootPatch }) { clientMutationId }
  d0: deleteTripFlight(input: { id: $d0_id }) { clientMutationId }
  u1: updateTripFlight(input: { id: $u1_id, patch: $u1_patch }) { clientMutationId }
  c2: createTripFlight(input: { tripFlight: $c2_input }) { clientMutationId }
}
```

All four mutations land in one request. Combined with `SingleTransactionPlugin` server-side, they are atomic — if any fails, all roll back.

Override `defaultSelection` in `composeMutation` if you want to receive more than `clientMutationId` per result.

## Smoke test

A small example exercising both `buildOperations` and `composeMutation` lives at `scripts/smoke.ts`:

```sh
yarn install
npx tsc scripts/smoke.ts --outDir scripts-dist --target es2020 --module commonjs --esModuleInterop --skipLibCheck
node scripts-dist/scripts/smoke.js
```

## Authors

- [Brendan McKenzie](https://www.brendanmckenzie.com/)
