function bufferToString(buffer) {
  let str = '';

  for (let i = 0; i < buffer.length; i++) {
    const value = buffer[i];
    str +=
      (value >= 0x20 && value <= 0x7e) || (value >= 0xa0 && value <= 0xff)
        ? String.fromCharCode(value)
        : '.';
  }

  return str;
}

function print(head, buffer, { length = 50, separator = '|' } = {}) {
  const hex = buffer.toString('hex');
  const str = bufferToString(buffer);

  for (let i = 0; i < hex.length; i += length) {
    console.log(
      i ? ''.padEnd(head.length) : head,
      hex
        .substring(i, i + length)
        .replace(/(.{2})/g, '$1 ')
        .trim()
        .padEnd((length * 3) / 2 - 1),
      separator,
      str.substring(i / 2, (i + length) / 2)
    );
  }
}

module.exports = print;
