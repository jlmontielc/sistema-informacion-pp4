import { Icono } from '../Icono';

const CATEGORIAS = [
  { nombre: 'Fuerza', icono: 'dumbbell' },
  { nombre: 'Cardio', icono: 'heart' },
  { nombre: 'Flexibilidad', icono: 'flexibility' },
  { nombre: 'Salud', icono: 'shield' },
  { nombre: 'Nutrición', icono: 'nutrition' },
  { nombre: 'Recuperación', icono: 'recovery' },
];

export function Categorias() {
  return (
    <section className="landing-seccion landing-categorias">
      <div className="landing-categorias-contenedor">
        <h2 className="landing-categorias-titulo">Elige tu disciplina</h2>
        <p className="landing-categorias-bajada">
          Seis áreas de trabajo que tu entrenador combina según tu objetivo.
        </p>

        <ul className="landing-categorias-grid">
          {CATEGORIAS.map((categoria) => (
            <li key={categoria.nombre} className="landing-categoria">
              <Icono name={categoria.icono} size={56} className="landing-categoria-icono" />
              <span className="landing-categoria-nombre">{categoria.nombre}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
