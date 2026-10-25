import { Drill, Hammer, Ruler, Sprout, BrickWall, Droplets, Zap, HardHat, Package, Boxes, Wrench } from "lucide-react";

const ICONOS = {
  "herramientas-electricas": Drill,
  "herramientas-manuales": Hammer,
  medicion: Ruler,
  jardineria: Sprout,
  "construccion-y-albanileria": BrickWall,
  gasfiteria: Droplets,
  electricidad: Zap,
  "seguridad-epp": HardHat,
  "accesorios-y-consumibles": Package,
  almacenamiento: Boxes,
};

export default function IconoCategoria({ slug, className = "h-5 w-5" }) {
  const Icono = ICONOS[slug] || Wrench;
  return <Icono className={className} aria-hidden="true" />;
}
