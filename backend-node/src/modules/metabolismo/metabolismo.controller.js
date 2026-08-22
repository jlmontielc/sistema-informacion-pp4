const metabolismoService = require('./metabolismo.service');

const calcular = async (req, res, next) => {
  try {
    const datos = { ...req.body };

    if (req.usuario.rol === 'instruido') {
      datos.clienteId = req.usuario.id;
    } else if (req.body.clienteId) {
      datos.clienteId = Number(req.body.clienteId);
    } else {
      return res.status(400).json({ message: 'clienteId es requerido para calcular y guardar el histórico metabólico' });
    }

    const resultado = await metabolismoService.calcular(datos);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

module.exports = { calcular };
