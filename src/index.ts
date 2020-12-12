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
        this.status = 100;
        return this.runTask<T>(callback);
      case 100: return this.pushTask<T>();
      case 200: return Promise.resolve<T>(this.result);
      case 500: return Promise.reject(this.error);
      default: return Promise.reject(new Error('[WaitUntil] unknow status of ' + this.status));
    }
  }

  private runTask<T = any>(callback: () => Promise<T> | T) {
    return Promise.resolve<T>(callback()).then((data) => {
      this.status = 200;
      this.result = data;
      for (const { resolve } of this.stacks) resolve(data);
      return data;
    }).catch(e => {
      this.status = 500;
      this.error = e;
      for (const { reject } of this.stacks) reject(e);
      return Promise.reject(e);
    });
  }

  private pushTask<T = any>() {
    return new Promise<T>((resolve, reject) => {
      this.stacks.add({ resolve, reject });
    });
  }

  public reset() {
    this.status = 0;
    this.error = null;
    this.result = null;
    this.stacks.clear();
  }
}