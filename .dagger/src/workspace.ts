import { dag, object, func, Directory } from '@dagger.io/dagger'

@object()
export class Workspace {
  source: Directory

  constructor(source: Directory) {
    this.source = source
  }

  /**
   * Read a file in the Workspace
   *
   * @param path The path to the file in the workspace
   */
  @func()
  async readFile(path: string): Promise<string> {
    return await this.source.file(path).contents()
  }

  /**
   * Write a file to the Workspace
   *
   * @param path The path to the file in the workspace
   * @param contents The new contents of the file
   */
  @func()
  writeFile(path: string, contents: string): Workspace {
    this.source = this.source.withNewFile(path, contents)
    return this
  }

  /**
   * List all of the files in the Workspace
   */
  @func()
  async listFiles(): Promise<string> {
    return await dag
      .container()
      .from('alpine:3')
      .withDirectory('/src', this.source)
      .withWorkdir('/src')
      .withExec(['tree', './src'])
      .stdout()
  }

  @func()
  test(): Promise<string> {
    return new HelloDagger().test(this.source)
  }
}
