import { Link, type LinkProps } from 'react-router';
import { cn } from '~/lib/utils';
import type { ReactNode } from 'react';
import { type ColorPreset, colorPresets } from '~/presets/glowing-button';
import { isNullOrUndefined } from '~/utils/helpers';

type GlowingButtonProps = LinkProps & {
  colorPreset?: ColorPreset;
  renderIcon?: (iconProps: { className: string }) => ReactNode;
};

export function GlowingButton({
  className,
  children,
  renderIcon,
  colorPreset = 'default',
  ...props
}: GlowingButtonProps) {
  const colors = colorPresets[colorPreset];
  const iconClassName = `size-6 ${colors.iconColor} rotate-6 group-hover:rotate-12`;
  return (
    <div className={'relative group'}>
      <div
        className={`absolute -inset-4 bg-gradient-to-r ${colors.gradient}
         rounded-lg blur-lg opacity-85 group-hover:opacity-100
         transition duration-1000 group-hover:duration-200 animate-pulse`}
      ></div>
      <Link
        className={cn(
          `relative px-4 py-2 ${colors.background} rounded-lg leading-none flex items-center divide-x divide-gray-600`,
          className
        )}
        {...props}
      >
        <span className={'flex items-center space-x-5'}>
          {!isNullOrUndefined(renderIcon) && renderIcon({ className: iconClassName })}
          <span
            className={`${colors.textColor} pr-6 group-hover:${colors.textColor} transition duration-200`}
          >
            {children}
          </span>
        </span>
      </Link>
    </div>
  );
}
