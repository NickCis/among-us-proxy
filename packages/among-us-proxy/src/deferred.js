function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((rs, rj) => {
    resolve = rs;
    reject = rj;
  });

  return [promise, resolve, reject];
}

module.exports = deferred;
