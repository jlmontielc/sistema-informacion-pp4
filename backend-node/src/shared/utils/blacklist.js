const tokensInvalidados = new Set();

const agregar = (token) => {
  tokensInvalidados.add(token);
};

const estaInvalidado = (token) => tokensInvalidados.has(token);

module.exports = { agregar, estaInvalidado };
