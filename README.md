<div align="center">

# Amigo Secreto

**Secret Santa draws with private links and no server.**

[![CI & Deploy](https://github.com/tletelieru/amigo-secreto/actions/workflows/deploy.yml/badge.svg)](https://github.com/tletelieru/amigo-secreto/actions/workflows/deploy.yml)

[**Try it live**](https://tletelieru.github.io/amigo-secreto/)

</div>

## How it works

The draw runs in your browser. Each person gets a link with their match encrypted with AES-GCM. The key travels in the part of the URL after the `#`, which browsers never send to a server. The organizer sees only the list of people, so nobody has to know the result. Opening someone else's link would still show their match.

With everyone's Google email, the organizer gets one link for the whole group instead. Each person signs in with Google and the page opens only their result, still without a server. This keeps honest friends honest; it is not meant to stop someone who digs through the page code.

## Development

```sh
pnpm install
pnpm dev
pnpm lint
pnpm test
pnpm build
```

## License

MIT
