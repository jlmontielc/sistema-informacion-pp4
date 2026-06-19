const crypto = require('crypto');
const config = require('../constants');

const ALGORITHM = 'aes-256-cbc';

const encrypt = (text) => {
  if (!text) return null;
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(config.ENC_KEY, 'hex'), Buffer.from(config.ENC_IV, 'hex'));
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(config.ENC_KEY, 'hex'), Buffer.from(config.ENC_IV, 'hex'));
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

module.exports = { encrypt, decrypt };
