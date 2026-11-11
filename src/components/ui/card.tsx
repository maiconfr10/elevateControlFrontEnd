import type {HTMLAttributes} from 'react';
import {cn} from '../../lib/utils';
type DivProps=HTMLAttributes<HTMLDivElement>;
export function Card({className,children,...props}:DivProps){return <div className={cn('panel',className)} {...props}>{children}</div>}
export function CardHeader({className,children,...props}:DivProps){return <div className={cn('panel-header',className)} {...props}>{children}</div>}
export function CardContent({className,children,...props}:DivProps){return <div className={cn(className)} {...props}>{children}</div>}
