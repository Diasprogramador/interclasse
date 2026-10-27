export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? 'brand--compact' : ''}`} aria-label="Arena Escolar">
      <img className="school-logo" src="/school-logo.svg" alt="Brasão do Colégio Estadual" />
      {!compact && <span className="brand__text"><strong>ARENA</strong><small>ESCOLAR</small></span>}
    </div>
  )
}
