const crypto = require("crypto");

/*
 * Characters intentionally exclude confusing characters:
 *
 * 0 / O
 * 1 / I
 */
const CHARACTERS =
  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generateBlock = (length = 4) => {
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(
      0,
      CHARACTERS.length
    );

    result += CHARACTERS[randomIndex];
  }

  return result;
};

/*
 * Example:
 *
 * GC-K7P4-X9M2-TR8Q
 */
const generateGiftCardNumber = () => {
  return `GC-${generateBlock()}-${generateBlock()}-${generateBlock()}`;
};

/*
 * Example:
 *
 * 583914
 */
const generateGiftCardPin = () => {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
};

module.exports = {
  generateGiftCardNumber,
  generateGiftCardPin,
};
