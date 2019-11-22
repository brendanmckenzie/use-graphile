# use-graphile

The purpose of this library is to provide a friendly React hooks interface to the [`postgraphile-plugin-nested-mutations`](https://github.com/mlipscombe/postgraphile-plugin-nested-mutations) plugin for [Postgraphile](http://postgraphile.com/).

There are two sides to this library - form handling and patch building.

Form handling works in much the same way as most other form libraries out there, but with a slightly more opinionated way of dealing with certain data, most notably lists.

Patch building is where this library ties into the nested mutations Postgraphile plugin. This library will generate a patch to conform to the plugins requirements.

An example model can be [found here](examples/model.ts), and a very messy example of a component consuming the hook can be [found here](examples/App.tsx).

## Getting started

### The hook (`useGraphile`)

The entrypoint to this hook is the `useGraphile` method.

It takes the following parameters.

- `model` - this defines the overall model for all types available in your system<sup>1</sup>
  - see [examples/model.ts](examples/model.ts) for an example model structure
- `type` - this indicates which type we are targetting, i.e., which type are we providing the interface to work with
- `initialValues` - what is the current state of the object

<small><sup>1</sup> eventually there will be the process to generate this model via GraphQL query introspection; but for now, creating this model is a manual process</small>

Using [examples/model.ts](examples/model.ts) as our Model, you could instantiate the hook like so

```ts
const g = useGraphile(model, "customer", {});
```

This would instantiate our hook, letting it know we are working with the `customer` type defined in the model.

### Available methods

Once the hook is instantiated, the following methods are available (following the above example, these methods would be accessible on the `g` object).

`input: (key: string, checkbox: boolean = false)`

This will return the props required to hook up a standard `<input />` field, providing the input with its current value as well as an `onChange` method.

```jsx
<input {...g.input("example")} />
```

Specifying `true` to the `checkbox` parameter will slightly modify the value props passed back by this method - `checked` will be used rather than `value`

```jsx
<input {...g.input("example", true)} />
```

---

`textarea: (key: string)`

This works exactly the same as `input()` but is specifically for `<textarea />` fields.

```jsx
<textarea {...g.textarea("example")} />
```

---

`link: (key: string, render: RenderLinkField)`

This provides you with an interface for dealing with linked entities, in the example model, if you were targetting the `trip` model this would provide you with a simple interface for editing the customer.

```jsx
g.link("customer", cust => (
  <span>current customer: {JSON.stringify(cust.value)}</span>
));
```

This also provides you with the same methods here, you could, for example, setup an input field for the linked entity.

```jsx
g.link("customer", cust => (
  <>
    <label>Customer name</label>
    <input {...cust.input("name")} />
  </>
));
```

---

`multi: (key: string, render: RenderMultiField)`

Similar to the `link` method, `multi` allows you to reference collection properties.

```jsx
g.multi("trips", trips => (
  <ul>
    {trips.renderItems(trip => (
      <li>
        <label>Trip name</label>
        <input {...trip.input("name")} />
      </li>
    ))}
  </ul>
));
```

---

`select: (key: string, options: SelectOptions)`

This provides you with a helper method when working with `<select />` fields.

```jsx
const selectConfig: SelectOptions = {
  list: [
    { id: 0, name: "A" },
    { id: 1, name: "B" },
  ],
  valueKey: 'id',
  displayKey: 'name'
}

<select {...g.select("trips", selectConfig)} />
```

Async option lists are also supported.

```jsx
const selectConfig: SelectOptions = {
  listAsync: async () => {
    const options = await api.getOptions();

    return options;
  },
  valueKey: 'id',
  displayKey: 'name'
}

<select {...g.select("trips", selectConfig)} />
```

## Quick demo

Given this form configuration.

```jsx
const g = useGraphile(model, "trip", {});

return (
  <form>
    <label>Summary</label>
    <input {...g.input("summary")} />
    <hr />
    <label>Customer</label>
    {g.link("customer", l => (
      <>
        <label>Name</label>
        <input {...l.input("name")} />
        <button onClick={l.reset}>Reset</button>
      </>
    ))}

    <pre>{JSON.stringify(g.patch, null, 2)}</pre>
    <button type="button" onClick={handleSave} disabled={g.clean}>
      Save
    </button>
    <button type="reset" onClick={g.reset} disabled={g.clean}>
      Reset
    </button>
  </form>
);
```

This is an example of a generated patch.

```json
{
  "summary": "hello",
  "customerToCustomerId": {
    "create": {
      "name": "test"
    }
  }
}
```

### Authors

- [Brendan McKenzie](https://www.brendanmckenzie.com/)
