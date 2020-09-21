class ConnectionJar {
  constructor() {
    this.connectionsKeys = new Map();
    this.connections = {};
  }

  getKey(connection) {
    let key = this.connectionsKeys.get(connection);

    if (!key) {
      key = this.randomKey();
      this.connections[key] = connection;
      this.connectionsKeys.set(connection, key);
    }

    return key;
  }

  randomKey() {
    const key = Math.round(Math.random() * 10000);
    if (!this.connections[key]) return key;
    return this.randomKey();
  }

  add(connection) {
    return this.getKey(connection);
  }

  get(key) {
    return this.connections[key];
  }

  delete(connection) {
    const key = this.getKey(connection);
    delete this.connections[key];
    this.connectionsKeys.delete(connection);
    return key;
  }
}

export default ConnectionJar;
