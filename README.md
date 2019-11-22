# use-graphile

The purpose of this library is to provide a friendly React hooks interface to the [`postgraphile-plugin-nested-mutations`](https://github.com/mlipscombe/postgraphile-plugin-nested-mutations) plugin for [Postgraphile](http://postgraphile.com/).

This works by generating patches that match the required format described by the plugin.

An example model can be [found here](examples/model.ts), and a very messy example of a component consuming the hook can be [found here](examples/App.tsx).

## Quick demo

Given this form configuration.

```jsx
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
```

This is an example of a generated patch.

```json
{
  "customerToCustomerId": {
    "create": {
      "name": "test"
    }
  },
  "summary": "hello"
}
```

### Authors

- [Brendan McKenzie](https://www.brendanmckenzie.com/)
