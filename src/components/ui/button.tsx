import {Slot} from '@radix-ui/react-slot';
import {cva} from 'class-variance-authority';
import {cn} from '../../lib/utils';
import type {ButtonHTMLAttributes} from 'react';
export type ButtonVariant='primary'|'secondary'|'ghost';
export const buttonVariants=cva('btn',{variants:{variant:{primary:'btn-primary',secondary:'btn-secondary',ghost:'btn-ghost'}},defaultVariants:{variant:'primary'}});
export interface PrimitiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>{asChild?:boolean;variant?:ButtonVariant;}
export function PrimitiveButton({asChild=false,variant='primary',className,type='button',...props}:PrimitiveButtonProps){
  const Component=asChild?Slot:'button';
  return <Component type={asChild?undefined:type} className={cn(buttonVariants({variant}),className)} {...props}/>;
}
