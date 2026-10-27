export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? 'brand--compact' : ''}`} aria-label="Arena Escolar">
      <span className="crest" aria-hidden="true"><i className="crest__bolt" /><b>CE</b></span>
      {!compact && <span className="brand__text"><strong>ARENA</strong><small>ESCOLAR</small></span>}
    </div>
  )
}
