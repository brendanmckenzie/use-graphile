# use-graphile

The purpose of this library is to provide a friendly React hooks interface to the [`postgraphile-plugin-nested-mutations`](https://github.com/mlipscombe/postgraphile-plugin-nested-mutations) plugin for [Postgraphile](http://postgraphile.com/).

This works by generating patches that match the required format described by the plugin.

An example model can be [found here](examples/model.ts), and a very messy example of a component consuming the hook can be [found here](examples/App.tsx).

### Authors

- [Brendan McKenzie](https://www.brendanmckenzie.com/)
