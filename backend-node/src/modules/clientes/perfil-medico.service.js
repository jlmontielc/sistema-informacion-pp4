const { PerfilMedico } = require('./perfil-medico.model');
const { Cliente } = require('./clientes.model');
const { encrypt, decrypt } = require('../../shared/utils/crypto');
const config = require('../../shared/constants');

const SENSITIVE_FIELDS = ['alergias', 'intolerancias', 'lesiones', 'condicionesPreexistentes'];

const encryptFields = (data) => {
  const encrypted = { ...data };
  for (const field of SENSITIVE_FIELDS) {
    if (encrypted[field] !== undefined) {
      encrypted[field] = encrypt(encrypted[field]);
    }
  }
  return encrypted;
};

const decryptFields = (record) => {
  if (!record) return record;
  const data = record.toJSON ? record.toJSON() : { ...record };
  for (const field of SENSITIVE_FIELDS) {
    if (data[field]) {
      data[field] = decrypt(data[field]);
    }
  }
  return data;
};

const findByClienteId = async (clienteId, entrenadorId) => {
  const cliente = await Cliente.findOne({ where: { id: clienteId, entrenadorId } });
  if (!cliente) return null;
  const perfil = await PerfilMedico.findOne({ where: { clienteId } });
  return perfil ? decryptFields(perfil) : null;
};

const upsert = async (clienteId, data, entrenadorId) => {
  const cliente = await Cliente.findOne({ where: { id: clienteId, entrenadorId } });
  if (!cliente) return null;
  const encryptedData = encryptFields(data);
  const [perfil] = await PerfilMedico.upsert({ clienteId, ...encryptedData });
  return decryptFields(perfil);
};

module.exports = { findByClienteId, upsert };
