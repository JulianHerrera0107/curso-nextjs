import './ui/global.css';
import { inter } from './ui/fonts';

export default function RootLayout({
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
