function numberToHex(n, l = 2) {
  const hex = n.toString(16);
  if (hex.length < l)
    return `${Array(l - hex.length + 1).join('0')}${hex}`;
  return hex;
}

function stringToHex(str) {
  return Buffer.from(str, 'utf8').toString('hex');
}

module.exports = {
  numberToHex,
  stringToHex,
};
