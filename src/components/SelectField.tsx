import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { Children, useRef, useState } from 'react';
import { MENU_EDGE, MENU_GAP, menuPlacement } from '../lib/menu';

type Props = Omit<TextFieldProps, 'select' | 'slotProps'> & { emptyLabel?: boolean };

export default function SelectField({ children, emptyLabel, ...props }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState({ above: false, maxHeight: 320 });

  const show = () => {
    const field = root.current;
    if (!field) return;
    const viewport = window.visualViewport?.height ?? window.innerHeight;
    setPlacement(menuPlacement(field.getBoundingClientRect(), viewport, Children.count(children)));
    setOpen(true);
  };

  const anchor = placement.above ? 'top' : 'bottom';
  const origin = placement.above ? 'bottom' : 'top';

  return (
    <TextField
      {...props}
      select
      ref={root}
      slotProps={{
        inputLabel: emptyLabel ? { shrink: true } : undefined,
        select: {
          displayEmpty: emptyLabel,
          open,
          onOpen: show,
          onClose: () => setOpen(false),
          MenuProps: {
            anchorEl: () => root.current as HTMLDivElement,
            anchorOrigin: { vertical: anchor, horizontal: 'left' },
            transformOrigin: { vertical: origin, horizontal: 'left' },
            marginThreshold: MENU_EDGE,
            slotProps: {
              paper: {
                sx: {
                  maxHeight: placement.maxHeight,
                  mt: placement.above ? `-${MENU_GAP}px` : `${MENU_GAP}px`,
                },
              },
            },
          },
        },
      }}
    >
      {children}
    </TextField>
  );
}
