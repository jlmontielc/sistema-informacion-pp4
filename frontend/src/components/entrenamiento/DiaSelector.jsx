const DIAS = [
  { num: 1, abbr: 'Lun', nombre: 'Lunes' },
  { num: 2, abbr: 'Mar', nombre: 'Martes' },
  { num: 3, abbr: 'Mie', nombre: 'Miercoles' },
  { num: 4, abbr: 'Jue', nombre: 'Jueves' },
  { num: 5, abbr: 'Vie', nombre: 'Viernes' },
  { num: 6, abbr: 'Sab', nombre: 'Sabado' },
  { num: 7, abbr: 'Dom', nombre: 'Domingo' },
];

export function DiaSelector({ seleccionados = [], onToggle, modo = 'seleccion' }) {
  if (modo === 'vista') {
    return (
      <div className="dias-semana-grid">
        {DIAS.map((dia) => {
          const activo = seleccionados.includes(dia.num);
          return (
            <div
              key={dia.num}
              className={`dia-item ${activo ? 'seleccionado' : 'descanso'}`}
            >
              {dia.abbr}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="dias-semana-grid">
      {DIAS.map((dia) => {
        const seleccionado = seleccionados.includes(dia.num);
        return (
          <button
            key={dia.num}
            type="button"
            className={`dia-item ${seleccionado ? 'seleccionado' : ''}`}
            onClick={() => onToggle?.(dia.num)}
          >
            {dia.abbr}
          </button>
        );
      })}
    </div>
  );
}

export function obtenerNombreDia(num) {
  const dia = DIAS.find((d) => d.num === num);
  return dia ? dia.nombre : `Dia ${num}`;
}

export function obtenerAbbrDia(num) {
  const dia = DIAS.find((d) => d.num === num);
  return dia ? dia.abbr : `D${num}`;
}

export function obtenerDiaActual() {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 7 : jsDay;
}

export default DiaSelector;
