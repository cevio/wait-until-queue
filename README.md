# `wait-until-queue`

wait until callback done with queue

## Install

```bash
npm i wait-until-queue
```

## Usage

```ts
import { WaitUntil } from 'wait-until-queue';
const util = new WaitUntil();

await util.wait(() => new Promise<void>(resolve => {
  setTimeout(resolve, 3000);
}));
```