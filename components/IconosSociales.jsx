import { siWhatsapp, siFacebook, siInstagram, siTiktok } from "simple-icons";

function Icono({ icono, className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d={icono.path} />
    </svg>
  );
}

export const IconoWhatsApp = (p) => <Icono icono={siWhatsapp} {...p} />;
export const IconoFacebook = (p) => <Icono icono={siFacebook} {...p} />;
export const IconoInstagram = (p) => <Icono icono={siInstagram} {...p} />;
export const IconoTiktok = (p) => <Icono icono={siTiktok} {...p} />;
