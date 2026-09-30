import { Navegacion } from '../components/landing/secciones/Navegacion';
import { Hero } from '../components/landing/secciones/Hero';
import { ProgresoEntrenamiento } from '../components/landing/secciones/ProgresoEntrenamiento';
import { Categorias } from '../components/landing/secciones/Categorias';
import { Planes } from '../components/landing/secciones/Planes';
import { PasosEntrenamiento } from '../components/landing/secciones/PasosEntrenamiento';
import { Galeria } from '../components/landing/secciones/Galeria';
import { DatosCuriosos } from '../components/landing/secciones/DatosCuriosos';
import { PreguntasFrecuentes } from '../components/landing/secciones/PreguntasFrecuentes';
import { LlamadaAccion } from '../components/landing/secciones/LlamadaAccion';
import { PieDePagina } from '../components/landing/secciones/PieDePagina';

export default function LandingPage() {
  return (
    <div className="landing" id="inicio">
      <Navegacion />

      <main className="landing-principal">
        <Hero />
        <ProgresoEntrenamiento />
        <Categorias />
        <Planes />
        <PasosEntrenamiento />
        <Galeria />
        <DatosCuriosos />
        <PreguntasFrecuentes />
        <LlamadaAccion />
      </main>

      <PieDePagina />
    </div>
  );
}
