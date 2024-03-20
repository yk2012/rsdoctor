import { SDK } from '@rsdoctor/types';
import serve from 'serve-static';
import path from 'path';
import { File } from '@rsdoctor/utils/build';
import { BaseAPI } from './base';
import { Router } from '../router';

export class RendererAPI extends BaseAPI {
  private isClientServed = false;

  /** sdk manifest api */
  @Router.get(SDK.ServerAPI.API.EntryHtml)
  public async entryHtml(): Promise<
    SDK.ServerAPI.InferResponseType<SDK.ServerAPI.API.EntryHtml>
  > {
    const { server, res } = this.ctx;

    // dynamic serve client:
    // require.resolve will failed due to the dist will remove when execute "npm run build" of client.
    const clientHtmlPath = server.innerClientPath
      ? server.innerClientPath
      : require.resolve('@rsdoctor/client');
    if (!this.isClientServed) {
      this.isClientServed = true;
      const clientDistPath = path.resolve(clientHtmlPath, '..');
      server.app.use(serve(clientDistPath));
    }
    const clientHtml = await File.fse.readFile(clientHtmlPath, 'utf-8');

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-store');

    return clientHtml;
  }
}
