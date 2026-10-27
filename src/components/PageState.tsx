import { LoaderCircle, TriangleAlert } from 'lucide-react'

export function LoadingScreen() { return <div className="page-state"><LoaderCircle className="spin" size={28} /><strong>Preparando a arena...</strong></div> }
export function ErrorScreen({ message }: { message: string }) { return <div className="page-state"><TriangleAlert size={28} /><strong>Não foi possível carregar</strong><span>{message}</span></div> }
