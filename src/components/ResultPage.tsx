import { Box, ButtonBase, Card, CardContent, Link, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { messages } from '../i18n/messages';
import { useLocale, useMessages } from '../i18n/react';
import { burstConfetti } from '../lib/feedback';
import { readToken } from '../lib/link';
import type { Ticket } from '../lib/link';

const formatDate = (date: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(date));

function Envelope({ open }: { open: boolean }) {
  return (
    <Box sx={{ position: 'relative', width: 220, height: 150, perspective: 600 }}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '8px',
          bgcolor: 'primary.main',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: 16,
          right: 16,
          top: 12,
          bottom: 12,
          borderRadius: 1,
          bgcolor: 'background.paper',
          transition: 'transform 500ms ease 200ms',
          transform: open ? 'translateY(-70px)' : 'none',
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '8px',
          bgcolor: 'primary.dark',
          clipPath: 'polygon(0 30%, 50% 62%, 100% 30%, 100% 100%, 0 100%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 94,
          bgcolor: 'primary.light',
          clipPath: 'polygon(3% 2%, 97% 2%, 50% 100%)',
          transformOrigin: 'top',
          transition: 'transform 400ms ease',
          transform: open ? 'rotateX(180deg)' : 'none',
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }}
      />
    </Box>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ textAlign: 'right', overflowWrap: 'anywhere' }}>
        {value}
      </Typography>
    </Stack>
  );
}

export function CreateLink() {
  const t = useMessages(messages).result;

  return (
    <Link href={import.meta.env.BASE_URL} variant="body2" sx={{ textAlign: 'center' }}>
      {t.create}
    </Link>
  );
}

export function TicketView({ ticket }: { ticket: Ticket }) {
  const t = useMessages(messages).result;
  const locale = useLocale();
  const [revealed, setRevealed] = useState(false);
  const { giver, receiver, event } = ticket;

  return (
    <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
      <Box>
        <Typography variant="h3" component="h1" sx={{ fontSize: { xs: '2rem', sm: '2.75rem' } }}>
          {t.greeting(giver)}
        </Typography>
        {!revealed && (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {t.privateNote}
          </Typography>
        )}
      </Box>
      <ButtonBase
        aria-label={t.envelope}
        disabled={revealed}
        onClick={() => {
          setRevealed(true);
          burstConfetti();
        }}
        sx={{
          borderRadius: 2,
          pt: revealed ? 14 : 2,
          transition: 'padding-top 400ms ease',
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }}
      >
        <Envelope open={revealed} />
      </ButtonBase>
      {revealed ? (
        <Box role="status">
          <Typography color="text.secondary">{t.giveTo}</Typography>
          <Typography variant="h3" component="p" sx={{ overflowWrap: 'anywhere' }}>
            {receiver}
          </Typography>
        </Box>
      ) : (
        <Typography sx={{ fontWeight: 600 }}>{t.reveal}</Typography>
      )}
      {(event.name || event.date || event.amount || event.note) && (
        <Card variant="outlined" sx={{ width: '100%', maxWidth: 420 }}>
          <CardContent>
            <Stack spacing={1}>
              {event.name && <Fact label={t.event} value={event.name} />}
              {event.date && <Fact label={t.date} value={formatDate(event.date, locale)} />}
              {event.amount && <Fact label={t.amount} value={event.amount} />}
              {event.note && (
                <Typography variant="body2" sx={{ textAlign: 'left', whiteSpace: 'pre-wrap' }}>
                  {event.note}
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}
      <CreateLink />
    </Stack>
  );
}

export default function ResultPage({ token }: { token: string }) {
  const t = useMessages(messages).result;
  const [loaded, setLoaded] = useState<{ token: string; ticket: Ticket | null } | null>(null);

  useEffect(() => {
    let active = true;
    void readToken(token).then((ticket) => {
      if (active) setLoaded({ token, ticket });
    });
    return () => {
      active = false;
    };
  }, [token]);

  const current = loaded?.token === token ? loaded : null;

  if (!current) return <Typography color="text.secondary">{t.loading}</Typography>;

  if (!current.ticket) {
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

  return <TicketView ticket={current.ticket} />;
}
