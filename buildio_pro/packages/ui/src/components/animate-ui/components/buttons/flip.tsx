import { getStrictContext } from '@workspace/ui/lib/get-strict-context';
import { type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { buttonVariants } from '@workspace/ui/components/animate-ui/components/buttons/button';
import {
  FlipButton as FlipButtonPrimitive,
  FlipButtonFront as FlipButtonFrontPrimitive,
  FlipButtonBack as FlipButtonBackPrimitive,
  type FlipButtonProps as FlipButtonPrimitiveProps,
  type FlipButtonFrontProps as FlipButtonFrontPrimitiveProps,
  type FlipButtonBackProps as FlipButtonBackPrimitiveProps,
} from '@workspace/ui/components/animate-ui/primitives/buttons/flip';
import { cn } from '@workspace/ui/lib/utils';

type FlipButtonContextType = VariantProps<typeof buttonVariants>;

const [FlipButtonProvider, useFlipButton] =
  getStrictContext<FlipButtonContextType>('FlipButtonContext');

type FlipButtonProps = FlipButtonPrimitiveProps &
  VariantProps<typeof buttonVariants>;

function FlipButton({ variant, size, ...props }: FlipButtonProps) {
  return (
    <FlipButtonProvider value={{ variant, size }}>
      <FlipButtonPrimitive {...props} />
    </FlipButtonProvider>
  );
}

type FlipButtonFrontProps = FlipButtonFrontPrimitiveProps &
  VariantProps<typeof buttonVariants>;

function FlipButtonFront({
  variant,
  size,
  className,
  ...props
}: FlipButtonFrontProps) {
  const { variant: buttonVariant, size: buttonSize } = useFlipButton();
  return (
    <FlipButtonFrontPrimitive
      className={cn(
        buttonVariants({
          variant: variant ?? buttonVariant,
          size: size ?? buttonSize,
          className,
        }),
      )}
      {...props}
    />
  );
}

type FlipButtonBackProps = FlipButtonBackPrimitiveProps &
  VariantProps<typeof buttonVariants>;

function FlipButtonBack({
  variant,
  size,
  className,
  ...props
}: FlipButtonBackProps) {
  const { variant: buttonVariant, size: buttonSize } = useFlipButton();
  return (
    <FlipButtonBackPrimitive
      className={cn(
        buttonVariants({
          variant: variant ?? buttonVariant,
          size: size ?? buttonSize,
          className,
        }),
      )}
      {...props}
    />
  );
}

export {
  FlipButton,
  FlipButtonFront,
  FlipButtonBack,
  type FlipButtonProps,
  type FlipButtonFrontProps,
  type FlipButtonBackProps,
};
