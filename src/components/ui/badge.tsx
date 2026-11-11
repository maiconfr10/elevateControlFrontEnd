import {cva} from 'class-variance-authority';
import {cn} from '../../lib/utils';
import type {HTMLAttributes} from 'react';
import type {BadgeTone} from '../../types';
export const badgeVariants=cva('badge',{variants:{tone:{blue:'badge-blue',green:'badge-green',amber:'badge-amber',red:'badge-red',neutral:'badge-neutral'}},defaultVariants:{tone:'neutral'}});
export interface PrimitiveBadgeProps extends HTMLAttributes<HTMLSpanElement>{tone?:BadgeTone;}
export function PrimitiveBadge({tone='neutral',className,children,...props}:PrimitiveBadgeProps){
  return <span className={cn(badgeVariants({tone}),className)} {...props}>{children}</span>;
}
