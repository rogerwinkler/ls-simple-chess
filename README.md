# MX Simple Chess (mx-simple-chess)

A simple chess game inspired by [Lauri Hartikka](https://www.freecodecamp.org/news/simple-chess-ai-step-by-step-1d55a9266977/).

_Version 0.1.3_

## Node Version

MX Simple Chess runs on `node 12.10.0`. Thus set the appropriate node version using `nvm`. If run on newer versions the `quasar` command might not be found.

```bash
nvm use 12.10.0
```

_**Note**: Use `nvm ls` to list installed node versions!_

## Clone Repo

```bash
git clone https://github.com/monexag/mx-simple-chess.git
```

## Install the dependencies

```bash
npm install
```

or

```bash
yarn install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

or

```bash
npm run dev
```

or

```bash
yarn dev
```

### Lint the files

```bash
npm run lint
```

### Build the app for production

```bash
quasar build
```

or

```bash
npm run build
```

or

```bash
yarn build
```

### Deploy the built SPA

Copy the folder `dist/spa` to a web server and serve the file `index.html`.

### Develop or Build for Mobile

If you want to build for a platform, just replace `dev` by `build` in the following commands.

For Android...

```bash
quasar dev -m android
```

For iOS...

```bash
quasar dev -m ios
```

For Electron...

```bash
quasar dev -m electron
```

### Customize the configuration

See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).

# License

See [LICENSE file](/LICENSE).
