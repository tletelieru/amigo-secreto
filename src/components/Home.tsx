import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { messages } from '../i18n/messages';
import { useMessages } from '../i18n/react';
import { emptyGroup, parseGroup } from '../lib/group';
import type { Group } from '../lib/group';
import { localGroupStore } from '../lib/store';
import ConfirmDialog from './ConfirmDialog';
import GroupEditor from './GroupEditor';
import LinksPanel from './LinksPanel';

function download(group: Group) {
  const blob = new Blob([JSON.stringify(group, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${group.event.name.trim() || 'amigo-secreto'}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function Home() {
  const t = useMessages(messages);
  const [group, setGroup] = useState<Group>(() => localGroupStore.load());
  const [pending, setPending] = useState<Group | null>(null);
  const [invalid, setInvalid] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const hasContent = group.participants.length > 0 || group.event.name !== '';

  useEffect(() => localGroupStore.save(group), [group]);

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    event.target.value = '';
    if (!picked) return;
    const parsed = parseGroup(await picked.text());
    setInvalid(parsed === null);
    if (!parsed) return;
    if (hasContent) setPending(parsed);
    else setGroup(parsed);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" component="h1" sx={{ fontSize: { xs: '2rem', sm: '2.75rem' } }}>
          {t.hero.title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {t.hero.subtitle}
        </Typography>
      </Box>
      {group.result ? (
        <LinksPanel group={group} result={group.result} onChange={setGroup} />
      ) : (
        <GroupEditor group={group} onChange={setGroup} />
      )}
      {invalid && <Alert severity="error">{t.data.invalid}</Alert>}
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button disabled={!hasContent} onClick={() => download(group)}>
          {t.data.export}
        </Button>
        <Button onClick={() => file.current?.click()}>{t.data.import}</Button>
        <Button disabled={!hasContent} onClick={() => setPending(emptyGroup())}>
          {t.data.reset}
        </Button>
        <input
          ref={file}
          hidden
          type="file"
          accept="application/json,.json"
          aria-label={t.data.import}
          onChange={(event) => void onFile(event)}
        />
      </Stack>
      <ConfirmDialog
        open={pending !== null}
        title={pending?.participants.length ? t.data.importTitle : t.data.resetTitle}
        body={pending?.participants.length ? t.data.importBody : t.data.resetBody}
        action={t.data.confirm}
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (pending) setGroup(pending);
          setPending(null);
        }}
      />
    </Stack>
  );
}
