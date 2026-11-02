import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { messages } from '../i18n/messages';
import { useMessages } from '../i18n/react';

type Props = {
  open: boolean;
  title: string;
  body: string;
  action: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({ open, title, body, action, onClose, onConfirm }: Props) {
  const t = useMessages(messages);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{body}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t.links.cancel}</Button>
        <Button variant="contained" onClick={onConfirm}>
          {action}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
