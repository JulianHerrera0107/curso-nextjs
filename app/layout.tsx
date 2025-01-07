import './ui/global.css';
import { inter } from './ui/fonts';

export default function RootLayout({
  //Este archivo será considerado el root layout
  //Todos los cambios en la interfaz del usuario serán compartidas em
  //todos los archivos page.tsx del proyecto
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      
      <body className={`${inter.className} antialiased`}
      //Permite añadir un estilo de fuente inter a la clase body
      //Antialiased permite optimizar el tiempo de carga (De Tailwind)
      >{children}</body>
    </html>
  );
}
