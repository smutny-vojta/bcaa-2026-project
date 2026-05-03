# BCAA 2026 Project

> **Upozornění:** Vývoj tohoto projektu ve frameworku Next.js byl povolem panem profesorem **Ivem Milotou**.

Webová aplikace pro evidenci jízd a zpoždění postavená na Next.js a MongoDB.

## Co projekt obsahuje

- Next.js 16 + React 19
- MongoDB jako datové úložiště
- logiku pro trasy a záznamy o zpoždění v `src/features`
- základní testy ve Vitestu

## Požadavky

- Docker a Docker Compose
- port `3000` pro aplikaci
- port `27017` pro MongoDB

## Spuštění lokálně přes Docker Compose

1. Nainstalujte závislosti v kontejneru aplikace:

```bash
docker compose run --rm app npm install
```

2. Spusťte aplikaci i databázi:

```bash
docker compose up
```

3. Otevřete aplikaci na adrese [http://localhost:3000](http://localhost:3000).

Docker Compose spouští tyto služby:

- `mongo` jako databázi MongoDB
- `app` jako vývojový server Next.js

V kontejneru je nastaveno:

- `MONGODB_URI=mongodb://mongo:27017/bcaa`
- `MONGODB_DB=bcaa` jako výchozí databáze v kódu

## Spuštění testů

Testy běží přes Vitest a načítají proměnné z `.env.test`:

```bash
npm test
```

nebo v watch režimu:

```bash
npm run test:watch
```

## Scripty

- `npm run dev` - spustí vývojový server
- `npm run build` - vytvoří produkční build
- `npm run start` - spustí produkční server
- `npm run lint` - zkontroluje formát a kvalitu kódu pomocí Biome
- `npm run format` - naformátuje kód pomocí Biome