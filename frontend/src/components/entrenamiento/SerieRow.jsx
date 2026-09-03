import { useState } from 'react';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';

const formatearNumero = (valor, paso = 1) => {
  if (valor === '' || valor === undefined || valor === null) return '';
  const num = paso === 1 ? parseInt(valor, 10) : parseFloat(valor);
  return Number.isFinite(num) ? num : '';
};

export function SerieRow({
  serie,
  esNueva = false,
  numeroSerie,
  onGuardar,
  onEliminar,
  onCancelar,
}) {
  const [form, setForm] = useState({
    repeticionesRealizadas: serie?.repeticionesRealizadas ?? '',
    pesoKg: serie?.pesoKg ?? '',
    descansoSegundos: serie?.descansoSegundos ?? '',
    rpe: serie?.rpe ?? '',
    notas: serie?.notas ?? '',
  });

  const handleChange = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleGuardar = () => {
    const datos = {
      ...form,
      repeticionesRealizadas: parseInt(form.repeticionesRealizadas, 10) || 0,
      pesoKg: parseFloat(form.pesoKg) || 0,
      descansoSegundos: parseInt(form.descansoSegundos, 10) || 0,
      rpe: form.rpe ? parseInt(form.rpe, 10) : undefined,
    };
    onGuardar(datos);
    if (esNueva) {
      setForm({
        repeticionesRealizadas: '',
        pesoKg: '',
        descansoSegundos: '',
        rpe: '',
        notas: '',
      });
    }
  };

  const puedeGuardar =
    form.repeticionesRealizadas !== '' && form.pesoKg !== '' && form.descansoSegundos !== '';

  return (
    <div className={`serie-row ${!esNueva ? 'serie-row-guardada' : ''}`}>
      <div className="serie-numero">{numeroSerie}</div>
      <div className="serie-field">
        <label>KG</label>
        <input
          type="number"
          min={0}
          step={0.5}
          value={form.pesoKg}
          onChange={(e) => handleChange('pesoKg', formatearNumero(e.target.value, 0.5))}
          placeholder="0"
        />
      </div>
      <div className="serie-field">
        <label>Reps</label>
        <input
          type="number"
          min={0}
          value={form.repeticionesRealizadas}
          onChange={(e) => handleChange('repeticionesRealizadas', formatearNumero(e.target.value))}
          placeholder="0"
        />
      </div>
      <div className="serie-field">
        <label>Desc</label>
        <input
          type="number"
          min={0}
          step={5}
          value={form.descansoSegundos}
          onChange={(e) => handleChange('descansoSegundos', formatearNumero(e.target.value))}
          placeholder="s"
        />
      </div>
      <div className="serie-field serie-field-rpe">
        <label>RPE</label>
        <input
          type="number"
          min={1}
          max={10}
          value={form.rpe}
          onChange={(e) => handleChange('rpe', formatearNumero(e.target.value))}
          placeholder="-"
        />
      </div>
      <div className="serie-acciones">
        {esNueva ? (
          <Button size="sm" variant="primary" onClick={handleGuardar} disabled={!puedeGuardar}>
            <Icon name="check" size={16} />
          </Button>
        ) : (
          <>
            <Button size="sm" variant="primary" onClick={handleGuardar} disabled={!puedeGuardar}>
              <Icon name="check" size={16} />
            </Button>
            <Button size="sm" variant="ghost" onClick={onEliminar}>
              <Icon name="close" size={16} />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
