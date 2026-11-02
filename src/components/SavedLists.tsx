import { Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { messages } from '../i18n/messages';
import { useMessages } from '../i18n/react';
import { limits } from '../lib/group';
import type { Group } from '../lib/group';
import { applyList, loadLists, saveLists, toSavedList, upsertList } from '../lib/lists';
import type { SavedList } from '../lib/lists';
import ConfirmDialog from './ConfirmDialog';
import { CloseIcon } from './icons';

type Props = { group: Group; onChange: (group: Group) => void };

export default function SavedLists({ group, onChange }: Props) {
  const t = useMessages(messages).lists;
  const [lists, setLists] = useState<SavedList[]>(loadLists);
  const [name, setName] = useState('');
  const [pending, setPending] = useState<SavedList | null>(null);
  const hasPeople = group.participants.length > 0;

  const store = (next: SavedList[]) => {
    setLists(next);
    saveLists(next);
  };

  const saveCurrent = () => {
    if (!name.trim() || !hasPeople) return;
    store(upsertList(lists, toSavedList(group, name)));
    setName('');
  };

  const pick = (list: SavedList) => {
    if (hasPeople) setPending(list);
    else onChange(applyList(group, list));
  };

  return (
    <Stack spacing={1.5}>
      {lists.length > 0 && (
        <Stack spacing={1}>
          <Typography variant="subtitle2" component="h3">
            {t.title}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {lists.map((list) => (
              <Chip
                key={list.id}
                label={`${list.name} (${list.people.length})`}
                onClick={() => pick(list)}
                aria-label={t.load(list.name)}
                onDelete={() => store(lists.filter((saved) => saved.id !== list.id))}
                deleteIcon={<CloseIcon aria-label={t.remove(list.name)} />}
              />
            ))}
          </Box>
        </Stack>
      )}
      {hasPeople && (
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            size="small"
            label={t.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              saveCurrent();
            }}
            slotProps={{ htmlInput: { maxLength: limits.name } }}
          />
          <Button
            variant="outlined"
            disabled={!name.trim()}
            onClick={saveCurrent}
            sx={{ flexShrink: 0 }}
          >
            {t.save}
          </Button>
        </Stack>
      )}
      <ConfirmDialog
        open={pending !== null}
        title={t.replaceTitle}
        body={t.replaceBody}
        action={t.replace}
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (pending) onChange(applyList(group, pending));
          setPending(null);
        }}
      />
    </Stack>
  );
}
