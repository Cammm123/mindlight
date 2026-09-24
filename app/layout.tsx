import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Mindlight — A conversation, illuminated',description:'Chat, explore a 3D human brain, and discover the networks behind language, memory, and thought.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className="dark"><body>{children}</body></html>}
