import type { LucideIcon } from 'lucide-react'

type MotionIconProps = {
  icon: LucideIcon
  pattern?: 'orbit' | 'dots' | 'signal' | 'pulse'
  tone?: 'green' | 'yellow' | 'blue' | 'red'
}

export function MotionIcon({ icon: Icon, pattern = 'orbit', tone = 'green' }: MotionIconProps) {
  return <span className={`motion-icon motion-icon--${pattern} motion-icon--${tone}`} aria-hidden="true">
    <span className="motion-icon__stage"><Icon size={18} strokeWidth={1.9} /></span>
    <i /><i /><i />
  </span>
}
