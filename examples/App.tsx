import React, { useState, useEffect } from "react";
import ApolloClient, { gql } from "apollo-boost";

import { model } from "./model";
import query from "./query";
import useGraphile from "use-graphile";

import "./style.css";

const client = new ApolloClient({
  uri: "http://localhost:5000/graphql"
});

const id = "a45e7d18-3daf-4a09-8c72-939a732a2971";

const App: React.FC = () => {
  const [quote, setQuote] = useState<any>({});
  useEffect(() => {
    (async () => {
      const {
        data: {
          query: { quote }
        }
      } = await client.query({
        query,
        variables: { id }
      });
      setQuote(quote);
    })();
  }, []);

  const g = useGraphile(model, "quote", quote);

  const handleSave = () => {
    const mutation = gql`
      mutation($id: UUID!, $patch: QuotePatch!) {
        updateQuote(input: { patch: $patch, id: $id }) {
          clientMutationId
        }
      }
    `;

    client.mutate({ mutation, variables: { id, patch: g.patch } });
  };
  return (
    <div>
      <label>Summary</label>
      <input {...g.input("summary")} />
      <hr />
      <label>link (trip)</label>
      {g.link("trip", l => (
        <>
          <button onClick={l.reset}>Reset</button>
          <label>trip name</label>
          <input {...l.input("name")} />
        </>
      ))}
      <hr />
      <label>multi</label>
      {g.multi("quoteDays", m => (
        <div>
          <ul>
            {m.renderItems(
              i => (
                <li>
                  <div>
                    <label>Order</label>
                    <input {...i.input("order")} />
                  </div>
                  <div>
                    <label>Summary</label>
                    <textarea {...i.input("activitySummary")} />
                  </div>
                  <div>
                    <label>Detail</label>
                    <textarea {...i.input("activityDetail")} />
                  </div>
                  <div>
                    <label>Date</label>
                    <input {...i.input("date")} />
                  </div>
                  <strong>destinations</strong>
                  {i.multi("quoteDayDestinationsByDayId", m2 => (
                    <ul>
                      {m2.renderItems(
                        i2 => (
                          <li>
                            {i2.link("destination", l => (
                              <input {...l.input("name")} />
                            ))}
                          </li>
                        ),
                        "order"
                      )}
                    </ul>
                  ))}
                  <button onClick={i.remove}>Remove</button>
                  <button onClick={i.reset}>Reset</button>
                </li>
              ),
              "order"
            )}
          </ul>
          <small>item count: {m.items.length}</small>
          <button onClick={m.add}>Add</button>
        </div>
      ))}
      {/* <pre>{JSON.stringify(g.values, null, 2)}</pre> */}
      <pre>{JSON.stringify(g.patch, null, 2)}</pre>
      <button onClick={handleSave} disabled={Object.keys(g.patch).length === 0}>
        Save
      </button>
      <button onClick={g.reset} disabled={Object.keys(g.patch).length === 0}>
        Reset
      </button>
    </div>
  );
};

export default App;
