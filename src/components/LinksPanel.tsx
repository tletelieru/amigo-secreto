import {
  Alert,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  IconButton,
  LinearProgress,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { messages } from '../i18n/messages';
import { useMessages } from '../i18n/react';
import type { DrawResult, Group, Participant } from '../lib/group';
import { groupUrl } from '../lib/groupLink';
import { ticketUrl } from '../lib/link';
import ConfirmDialog from './ConfirmDialog';
import { PersonAvatar } from './GroupEditor';
import { CopyIcon, ShareIcon, WhatsAppIcon } from './icons';

type Props = { group: Group; result: DrawResult; onChange: (group: Group) => void };

const appUrl = () => new URL(import.meta.env.BASE_URL, location.origin).href;

export default function LinksPanel({ group, result, onChange }: Props) {
  const t = useMessages(messages);
  const [toast, setToast] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [individual, setIndividual] = useState(!result.groupToken);
  const total = group.participants.length;
  const sentCount = group.participants.filter((p) => result.sent[p.id]).length;
  const canShare = typeof navigator.share === 'function';

  const urlFor = (person: Participant) => ticketUrl(result.tokens[person.id], appUrl());
  const textFor = (person: Participant) =>
    t.links.message(person.name, group.event.name || t.appName);

  const groupLink = result.groupToken ? groupUrl(result.groupToken, appUrl()) : '';
  const groupText = `${t.group.linkTitle}: ${group.event.name || t.appName}`;

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast(t.links.copied);
    } catch {
      setToast(t.links.copyFailed);
    }
  };

  const shareLink = async (text: string, url: string) => {
    try {
      await navigator.share({ text, url });
    } catch {
      return;
    }
  };

  const whatsappHref = (person: Participant) =>
    `https://wa.me/?text=${encodeURIComponent(`${textFor(person)} ${urlFor(person)}`)}`;

  const setSent = (person: Participant, sent: boolean) =>
    onChange({
      ...group,
      result: { ...result, sent: { ...result.sent, [person.id]: sent } },
    });

  return (
    <Stack spacing={2}>
      {groupLink && (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" component="h2">
                {t.group.linkTitle}
              </Typography>
              <Typography color="text.secondary">{t.group.linkBody}</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<CopyIcon />}
                  onClick={() => void copyText(groupLink)}
                >
                  {t.links.copy}
                </Button>
                {canShare && (
                  <Button
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    onClick={() => void shareLink(groupText, groupLink)}
                  >
                    {t.links.share}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<WhatsAppIcon />}
                  href={`https://wa.me/?text=${encodeURIComponent(`${groupText} ${groupLink}`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.links.whatsapp}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            {individual && (
              <>
                <Typography variant="h6" component="h2">
                  {t.links.title}
                </Typography>
                <Typography color="text.secondary">{t.links.done}</Typography>
                <Alert severity="info">{t.links.warning}</Alert>
              </>
            )}
            {groupLink && (
              <Button onClick={() => setIndividual(!individual)}>
                {individual ? t.group.hideIndividual : t.group.showIndividual}
              </Button>
            )}
            {individual && (
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  {t.links.progress(sentCount, total)}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(sentCount / total) * 100}
                  aria-label={t.links.progress(sentCount, total)}
                />
              </Stack>
            )}
            {individual && (
              <Stack component="ul" spacing={1} sx={{ m: 0, p: 0, listStyle: 'none' }}>
                {group.participants.map((person) => (
                  <Stack
                    component="li"
                    key={person.id}
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <PersonAvatar person={person} />
                    <Typography noWrap sx={{ flexGrow: 1, minWidth: 0 }}>
                      {person.name}
                    </Typography>
                    <Tooltip title={`${t.links.copy}: ${person.name}`}>
                      <IconButton
                        aria-label={`${t.links.copy}: ${person.name}`}
                        onClick={() => void copyText(urlFor(person))}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canShare && (
                      <Tooltip title={`${t.links.share}: ${person.name}`}>
                        <IconButton
                          aria-label={`${t.links.share}: ${person.name}`}
                          onClick={() => void shareLink(textFor(person), urlFor(person))}
                        >
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={`${t.links.whatsapp}: ${person.name}`}>
                      <IconButton
                        aria-label={`${t.links.whatsapp}: ${person.name}`}
                        href={whatsappHref(person)}
                        target="_blank"
                        rel="noreferrer"
                        sx={{ color: '#25d366' }}
                      >
                        <WhatsAppIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <FormControlLabel
                      sx={{ mr: 0 }}
                      label={t.links.sent}
                      slotProps={{ typography: { variant: 'body2' } }}
                      control={
                        <Checkbox
                          size="small"
                          checked={result.sent[person.id] ?? false}
                          slotProps={{
                            input: { 'aria-label': `${t.links.sent}: ${person.name}` },
                          }}
                          onChange={(e) => setSent(person, e.target.checked)}
                        />
                      }
                    />
                  </Stack>
                ))}
              </Stack>
            )}
            <Button variant="outlined" onClick={() => setConfirming(true)}>
              {t.links.redo}
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={confirming}
        title={t.links.redoTitle}
        body={t.links.redoBody}
        action={t.links.redo}
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          onChange({ ...group, result: null });
        }}
      />
      <Snackbar
        open={toast !== ''}
        message={toast}
        autoHideDuration={2500}
        onClose={() => setToast('')}
      />
    </Stack>
  );
}
