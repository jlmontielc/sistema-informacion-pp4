const feedbackService = require('./hitl-feedback.service');

const registrarFeedback = async (req, res, next) => {
  try {
    const feedback = await feedbackService.crearFeedback(req.usuario.id, req.body);
    res.status(201).json(feedback);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
};

const listarFeedback = async (req, res, next) => {
  try {
    const filtros = {
      clienteId: req.query.clienteId ? Number(req.query.clienteId) : undefined,
      accion: req.query.accion || undefined,
      limite: req.query.limite ? Number(req.query.limite) : undefined,
    };
    const feedbacks = await feedbackService.listarFeedbackPorEntrenador(req.usuario.id, filtros);
    res.json(feedbacks);
  } catch (err) {
    next(err);
  }
};

const listarFeedbackDietas = async (req, res, next) => {
  try {
    const filtros = {
      clienteId: req.query.clienteId ? Number(req.query.clienteId) : undefined,
      limite: req.query.limite ? Number(req.query.limite) : undefined,
      tipo: 'dieta',
    };
    const feedbacks = await feedbackService.listarFeedbackPorEntrenador(req.usuario.id, filtros);
    res.json(feedbacks);
  } catch (err) {
    next(err);
  }
};

module.exports = { registrarFeedback, listarFeedback, listarFeedbackDietas };
