export class WaitUntil {
  private status: 0 | 100 | 200 | 500 = 0;
  private error: any = null;
  private result: any = null;
  private readonly stacks: Set<{
    resolve: (data: any) => void,
    reject: (e: Error) => void,
  }> = new Set();

  public wait<T = any>(callback: () => Promise<T> | T): Promise<T> {
    switch (this.status) {
      case 0:
        this.pause();
        this.runTask<T>(callback);
        return this.pushTask();
      case 100: return this.pushTask<T>();
      case 200: return Promise.resolve<T>(this.result);
      case 500: return Promise.reject(this.error);
      default: return Promise.reject(new Error('[WaitUntil] unknow status of ' + this.status));
    }
  }

  private runTask<T = any>(callback: () => Promise<T> | T) {
    return Promise.resolve<T>(callback()).then((data) => {
      this.resolve(data);
      return data;
    }).catch(e => {
      this.reject(e);
      return Promise.reject(e);
    });
  }

  private pushTask<T = any>() {
    return new Promise<T>((resolve, reject) => {
      this.stacks.add({ resolve, reject });
    });
  }

  public pause() {
    this.status = 100;
  }

  public resolve(data: any) {
    if (this.status === 100) {
      this.status = 200;
      this.result = data;
      for (const { resolve } of this.stacks) resolve(data);
      this.stacks.clear();
    }
  }

  public reject(e: any) {
    if (this.status === 100) {
      this.status = 500;
      this.error = e;
      for (const { reject } of this.stacks) reject(e);
      this.stacks.clear();
    }
  }

  public reset() {
    if ([200, 500].indexOf(this.status) === -1) throw new Error('task not ready, you cannot reset');
    this.status = 0;
    this.error = null;
    this.result = null;
    this.stacks.clear();
  }
}