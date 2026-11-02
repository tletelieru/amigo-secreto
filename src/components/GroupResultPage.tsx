import { Alert, Box, Stack, Typography, useTheme } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { messages } from '../i18n/messages';
import { useLocale, useMessages } from '../i18n/react';
import { googleClientId, renderGoogleButton } from '../lib/google';
import { openEntry, readGroupToken } from '../lib/groupLink';
import type { GroupPayload } from '../lib/groupLink';
import type { Ticket } from '../lib/link';
import { CreateLink, TicketView } from './ResultPage';

const BUTTON_WIDTH = 280;

type SignInProps = { payload: GroupPayload; onTicket: (ticket: Ticket) => void };

function SignIn({ payload, onTicket }: SignInProps) {
  const t = useMessages(messages).group;
  const locale = useLocale();
  const dark = useTheme().palette.mode === 'dark';
  const button = useRef<HTMLDivElement>(null);
  const [missing, setMissing] = useState('');
  const [failed, setFailed] = useState(false);
  const clientId = googleClientId();

  useEffect(() => {
    if (!clientId || !button.current) return;
    const onEmail = async (email: string | null) => {
      const ticket = email ? await openEntry(payload, email) : null;
      if (ticket) onTicket(ticket);
      else setMissing(email ?? t.noEmail);
    };
    renderGoogleButton(button.current, {
      locale,
      dark,
      width: BUTTON_WIDTH,
      onEmail: (email) => void onEmail(email),
    }).catch(() => setFailed(true));
  }, [clientId, dark, locale, onTicket, payload, t.noEmail]);

  return (
    <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
      <Box>
        <Typography variant="h3" component="h1" sx={{ fontSize: { xs: '2rem', sm: '2.75rem' } }}>
          {payload.event.name || t.title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {t.subtitle}
        </Typography>
      </Box>
      {clientId ? (
        <Box ref={button} sx={{ minHeight: 44 }} />
      ) : (
        <Alert severity="warning">{t.notConfigured}</Alert>
      )}
      {failed && <Alert severity="error">{t.loadFailed}</Alert>}
      {missing && <Alert severity="warning">{t.notInGroup(missing)}</Alert>}
      <CreateLink />
    </Stack>
  );
}

export default function GroupResultPage({ token }: { token: string }) {
  const t = useMessages(messages).result;
  const payload = useMemo(() => readGroupToken(token), [token]);
  const [ticket, setTicket] = useState<Ticket | null>(null);

  if (!payload) {
    return (
      <Stack spacing={2}>
        <Typography variant="h4" component="h1">
          {t.invalidTitle}
        </Typography>
        <Typography color="text.secondary">{t.invalidBody}</Typography>
        <CreateLink />
      </Stack>
    );
  }

  return ticket ? (
    <TicketView ticket={ticket} />
  ) : (
    <SignIn payload={payload} onTicket={setTicket} />
  );
}
