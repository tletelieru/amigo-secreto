import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { messages } from '../i18n/messages';
import { useMessages } from '../i18n/react';
import { MIN_PARTICIPANTS } from '../lib/draw';
import { addParticipant, canDraw, limits, removeParticipant, runDraw } from '../lib/group';
import { googleClientId } from '../lib/google';
import { isEmail } from '../lib/groupLink';
import type { EventInfo, Group, Participant } from '../lib/group';
import { CloseIcon } from './icons';
import SavedLists from './SavedLists';
import SelectField from './SelectField';

const EMOJIS = ['', '🎄', '🎅', '🦌', '⛄', '🎁', '⭐', '🍪', '🧦', '🔔', '🕯️', '❄️'];

type Props = { group: Group; onChange: (group: Group) => void };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function PersonAvatar({ person }: { person: Participant }) {
  return (
    <Avatar sx={{ width: 36, height: 36, bgcolor: 'action.selected', color: 'text.primary' }}>
      {person.emoji || person.name[0].toUpperCase()}
    </Avatar>
  );
}

export default function GroupEditor({ group, onChange }: Props) {
  const t = useMessages(messages);
  const [name, setName] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [bothWays, setBothWays] = useState(true);
  const useEmails = Boolean(googleClientId());
  const { event, participants, exclusions, singleCycle } = group;
  const drawable = useMemo(() => canDraw(group), [group]);
  const enough = participants.length >= MIN_PARTICIPANTS;
  const nameOf = (id: string) => participants.find((p) => p.id === id)?.name ?? '';
  const duplicate = participants.some((p) => p.name.toLowerCase() === name.trim().toLowerCase());
  const ready = from && to && from !== to;

  const setEvent = (patch: Partial<EventInfo>) =>
    onChange({ ...group, event: { ...event, ...patch } });

  const add = () => {
    const next = addParticipant(group, name);
    if (next === group) return;
    onChange(next);
    setName('');
  };

  const onNameKey = (keyEvent: KeyboardEvent) => {
    if (keyEvent.key !== 'Enter') return;
    keyEvent.preventDefault();
    add();
  };

  const nextEmoji = (person: Participant) => {
    const emoji = EMOJIS[(EMOJIS.indexOf(person.emoji) + 1) % EMOJIS.length];
    onChange({
      ...group,
      participants: participants.map((p) => (p.id === person.id ? { ...p, emoji } : p)),
    });
  };

  const setEmail = (id: string, email: string) =>
    onChange({
      ...group,
      participants: participants.map((p) => (p.id === id ? { ...p, email } : p)),
    });

  const remove = (id: string) => {
    onChange(removeParticipant(group, id));
    if (from === id) setFrom('');
    if (to === id) setTo('');
  };

  const addExclusion = () => {
    if (!ready) return;
    onChange({ ...group, exclusions: [...exclusions, { from, to, oneWay: !bothWays }] });
    setFrom('');
    setTo('');
  };

  const start = async () => {
    const next = await runDraw(group);
    if (next) onChange(next);
  };

  return (
    <Stack spacing={2}>
      <Section title={t.event.title}>
        <TextField
          label={t.event.name}
          value={event.name}
          onChange={(e) => setEvent({ name: e.target.value })}
          slotProps={{ htmlInput: { maxLength: limits.eventName } }}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            type="date"
            label={t.event.date}
            value={event.date}
            onChange={(e) => setEvent({ date: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            fullWidth
            label={t.event.amount}
            value={event.amount}
            onChange={(e) => setEvent({ amount: e.target.value })}
            slotProps={{ htmlInput: { maxLength: limits.amount } }}
          />
        </Stack>
        <TextField
          multiline
          minRows={2}
          label={t.event.note}
          value={event.note}
          onChange={(e) => setEvent({ note: e.target.value })}
          slotProps={{ htmlInput: { maxLength: limits.note } }}
        />
      </Section>

      <Section title={t.people.title}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            label={t.people.addLabel}
            value={name}
            error={duplicate}
            helperText={duplicate ? t.people.duplicate : undefined}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={onNameKey}
            slotProps={{ htmlInput: { maxLength: limits.name } }}
          />
          <Button
            variant="contained"
            onClick={add}
            disabled={!name.trim() || duplicate}
            sx={{ height: 56 }}
          >
            {t.people.add}
          </Button>
        </Stack>
        {participants.length === 0 ? (
          <Typography color="text.secondary">{t.people.empty}</Typography>
        ) : (
          <Stack component="ul" spacing={1.5} sx={{ m: 0, p: 0, listStyle: 'none' }}>
            {participants.map((person) => (
              <Stack component="li" key={person.id} spacing={0.75}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Tooltip title={t.people.emoji(person.name)}>
                    <IconButton
                      size="small"
                      aria-label={t.people.emoji(person.name)}
                      onClick={() => nextEmoji(person)}
                      sx={{ p: 0 }}
                    >
                      <PersonAvatar person={person} />
                    </IconButton>
                  </Tooltip>
                  <Typography noWrap sx={{ flexGrow: 1 }}>
                    {person.name}
                  </Typography>
                  <IconButton
                    size="small"
                    aria-label={t.people.remove(person.name)}
                    onClick={() => remove(person.id)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
                {useEmails && (
                  <TextField
                    size="small"
                    type="email"
                    label={t.people.email(person.name)}
                    value={person.email ?? ''}
                    error={Boolean(person.email) && !isEmail(person.email ?? '')}
                    helperText={
                      person.email && !isEmail(person.email) ? t.people.emailInvalid : undefined
                    }
                    onChange={(e) => setEmail(person.id, e.target.value)}
                  />
                )}
              </Stack>
            ))}
          </Stack>
        )}
        {useEmails && participants.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            {t.people.emailHint}
          </Typography>
        )}
        <SavedLists group={group} onChange={onChange} />
      </Section>

      {participants.length >= 2 && (
        <Section title={t.exclusions.title}>
          <Typography variant="body2" color="text.secondary">
            {t.exclusions.hint}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <SelectField
              fullWidth
              label={t.exclusions.from}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            >
              {participants.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </SelectField>
            <SelectField
              fullWidth
              label={t.exclusions.to}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            >
              {participants
                .filter((p) => p.id !== from)
                .map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
            </SelectField>
          </Stack>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}
          >
            <FormControlLabel
              label={t.exclusions.bothWays}
              control={
                <Switch checked={bothWays} onChange={(e) => setBothWays(e.target.checked)} />
              }
            />
            <Button variant="outlined" disabled={!ready} onClick={addExclusion}>
              {t.exclusions.add}
            </Button>
          </Stack>
          {exclusions.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {exclusions.map((exclusion, index) => {
                const left = nameOf(exclusion.from);
                const right = nameOf(exclusion.to);
                return (
                  <Chip
                    key={`${exclusion.from}-${exclusion.to}-${index}`}
                    label={`${left} ${exclusion.oneWay ? '→' : '↔'} ${right}`}
                    onDelete={() =>
                      onChange({ ...group, exclusions: exclusions.filter((e) => e !== exclusion) })
                    }
                    deleteIcon={<CloseIcon aria-label={t.exclusions.remove(left, right)} />}
                  />
                );
              })}
            </Box>
          )}
        </Section>
      )}

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <FormControlLabel
                label={t.run.singleCycle}
                control={
                  <Switch
                    checked={singleCycle}
                    onChange={(e) => onChange({ ...group, singleCycle: e.target.checked })}
                  />
                }
              />
              <Typography variant="body2" color="text.secondary">
                {t.run.singleCycleHint}
              </Typography>
            </Box>
            {!enough && <Alert severity="info">{t.run.needPeople(MIN_PARTICIPANTS)}</Alert>}
            {enough && !drawable && (
              <Alert severity="warning">
                {singleCycle ? t.run.impossibleCycle : t.run.impossible}
              </Alert>
            )}
            <Button
              size="large"
              variant="contained"
              disabled={!drawable}
              onClick={() => void start()}
            >
              {t.run.draw}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
