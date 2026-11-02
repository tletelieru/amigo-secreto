type GoogleId = {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential: string }) => void;
    auto_select: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
  prompt: () => void;
};

type ButtonOptions = {
  locale: string;
  dark: boolean;
  width: number;
  onEmail: (email: string | null) => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

const SCRIPT_URL = 'https://accounts.google.com/gsi/client';

let script: Promise<void> | null = null;

export const googleClientId = (): string =>
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? '';

function loadScript(): Promise<void> {
  script ??= new Promise((resolve, reject) => {
    const tag = document.createElement('script');
    tag.src = SCRIPT_URL;
    tag.async = true;
    tag.onload = () => resolve();
    tag.onerror = () => {
      script = null;
      reject(new Error('Google sign-in failed to load'));
    };
    document.head.append(tag);
  });
  return script;
}

export function emailFromCredential(credential: string): string | null {
  try {
    const part = credential.split('.')[1].replaceAll('-', '+').replaceAll('_', '/');
    const bytes = Uint8Array.from(atob(part), (char) => char.charCodeAt(0));
    const claims = JSON.parse(new TextDecoder().decode(bytes)) as {
      email?: string;
      email_verified?: boolean;
    };
    return claims.email && claims.email_verified ? claims.email : null;
  } catch {
    return null;
  }
}

export async function renderGoogleButton(parent: HTMLElement, options: ButtonOptions) {
  await loadScript();
  const id = window.google?.accounts.id;
  if (!id) throw new Error('Google sign-in is unavailable');
  id.initialize({
    client_id: googleClientId(),
    auto_select: true,
    callback: ({ credential }) => options.onEmail(emailFromCredential(credential)),
  });
  id.renderButton(parent, {
    type: 'standard',
    theme: options.dark ? 'filled_black' : 'outline',
    size: 'large',
    shape: 'pill',
    text: 'continue_with',
    locale: options.locale,
    width: options.width,
  });
  id.prompt();
}
