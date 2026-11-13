const { Client } = require("pg");
const db = require("../config/db");
const listeners = new Set();
let connection;
let retry;

function listen() {
  retry = null;
  const client = new Client(db.options);
  connection = client;
  const reconnect = () => {
    if (connection !== client) return;
    connection = null;
    client.end().catch(() => {});
    if (listeners.size) retry = setTimeout(listen, 1000);
  };
  client.on("error", reconnect);
  client.on("notification", ({ payload }) => {
    const change = JSON.parse(payload);
    for (const send of listeners) send(change);
  });
  client.connect().then(() => client.query("LISTEN queue_changes")).then(() => {
    for (const send of listeners) send(null);
  }).catch(reconnect);
}

function subscribe(send) {
  listeners.add(send);
  if (!connection && !retry) listen();
  return () => {
    listeners.delete(send);
    if (!listeners.size) {
      clearTimeout(retry);
      retry = null;
      const client = connection;
      connection = null;
      client?.end().catch(() => {});
    }
  };
}

module.exports = { subscribe };
