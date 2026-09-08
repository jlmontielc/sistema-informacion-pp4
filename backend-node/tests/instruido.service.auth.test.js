const instruidoService = require('../src/modules/instruidos/instruido.service');

jest.mock('../src/modules/instruidos/instruido.model', () => {
  const crearModeloMock = () => ({
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  });
  return { Instruido: crearModeloMock() };
});

jest.mock('bcryptjs', () => ({
  hash: jest.fn((valor) => Promise.resolve(`hash(${valor})`)),
}));

const { Instruido } = require('../src/modules/instruidos/instruido.model');
const bcrypt = require('bcryptjs');

const crearInstruidoMock = (sobreescribir = {}) => ({
  id: 1,
  nombre: 'Cliente A',
  email: 'cliente@test.com',
  edad: 30,
  peso: 75,
  altura: 1.75,
  sexo: 'masculino',
  nivelActividad: 'moderado',
  diasDisponibles: 3,
  diasSemana: [1, 3, 5],
  entrenadorId: 2,
  ...sobreescribir,
});

const resetearMocks = () => {
  Instruido.findAll.mockReset();
  Instruido.findOne.mockReset();
  Instruido.findByPk.mockReset();
  Instruido.create.mockReset();
  bcrypt.hash.mockClear();
};

describe('InstruidoService - autorización', () => {
  beforeEach(resetearMocks);

  describe('obtenerPorId', () => {
    test('entrenador no puede obtener instruido ajeno', async () => {
      Instruido.findOne.mockResolvedValue(null);

      const resultado = await instruidoService.obtenerPorId(5, 2, 'entrenador');

      expect(resultado).toBeNull();
      expect(Instruido.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 5, entrenadorId: 2 },
          attributes: expect.objectContaining({ exclude: ['contrasenaHash'] }),
        }),
      );
    });

    test('administrador puede obtener cualquier instruido', async () => {
      const instruido = crearInstruidoMock({ id: 5, entrenadorId: 99 });
      Instruido.findOne.mockResolvedValue(instruido);

      const resultado = await instruidoService.obtenerPorId(5, 99, 'administrador');

      expect(resultado).toEqual(instruido);
      expect(Instruido.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 5 },
          attributes: expect.objectContaining({ exclude: ['contrasenaHash'] }),
        }),
      );
    });
  });

  describe('actualizar', () => {
    test('entrenador no puede actualizar instruido ajeno', async () => {
      Instruido.findOne.mockResolvedValue(null);

      const resultado = await instruidoService.actualizar(5, { nombre: 'Otro' }, 2, 'entrenador');

      expect(resultado).toBeNull();
      expect(Instruido.findOne).toHaveBeenCalledWith({ where: { id: 5, entrenadorId: 2 } });
    });

    test('administrador puede actualizar cualquier instruido', async () => {
      const instruido = {
        ...crearInstruidoMock({ id: 5, entrenadorId: 99 }),
        update: jest.fn(function actualizar(campos) {
          Object.assign(this, campos);
          return Promise.resolve(this);
        }),
      };
      Instruido.findOne.mockResolvedValue(instruido);
      Instruido.findByPk.mockResolvedValue({ ...instruido, nombre: 'Actualizado' });

      const resultado = await instruidoService.actualizar(5, { nombre: 'Actualizado' }, 99, 'administrador');

      expect(instruido.update).toHaveBeenCalledWith(expect.objectContaining({ nombre: 'Actualizado' }));
      expect(resultado.nombre).toBe('Actualizado');
    });
  });

  describe('eliminar', () => {
    test('entrenador no puede eliminar instruido ajeno', async () => {
      Instruido.findOne.mockResolvedValue(null);

      const resultado = await instruidoService.eliminar(5, 2, 'entrenador');

      expect(resultado).toBeNull();
      expect(Instruido.findOne).toHaveBeenCalledWith({ where: { id: 5, entrenadorId: 2 } });
    });

    test('administrador puede eliminar cualquier instruido', async () => {
      const instruido = {
        ...crearInstruidoMock({ id: 5, entrenadorId: 99 }),
        destroy: jest.fn().mockResolvedValue(undefined),
      };
      Instruido.findOne.mockResolvedValue(instruido);

      const resultado = await instruidoService.eliminar(5, 99, 'administrador');

      expect(instruido.destroy).toHaveBeenCalled();
    });
  });
});
