import { isCancel } from 'axios';
import { z } from 'zod';

import { setupHttpMock } from '@/test/http-mock';

import { HttpValidationError } from '../api.types';

import { httpClient } from './http-client';

describe('httpClient', () => {
  const mock = setupHttpMock();


  it('returns the parsed body unchanged in shape when it matches responseSchema', async () => {
    const schema = z.object({ id: z.number(), title: z.string() });
    mock.onGet('/posts/1').reply(200, { id: 1, title: 'hello' });

    const result = await httpClient.get('/posts/1', { responseSchema: schema });

    expect(result).toEqual({ id: 1, title: 'hello' });
  });

  it('returns the raw body untouched when no responseSchema is supplied', async () => {
    mock.onGet('/posts/2').reply(200, { id: 2, title: 'no schema', extra: 'field' });

    const result = await httpClient.get('/posts/2');

    expect(result).toEqual({ id: 2, title: 'no schema', extra: 'field' });
  });

  it('rejects with HttpValidationError carrying context and issues when the body fails schema', async () => {
    const schema = z.object({ id: z.number(), title: z.string() });
    mock.onGet('/posts/3').reply(200, { id: 'not-a-number', title: 42 });

    await expect(httpClient.get('/posts/3', { responseSchema: schema })).rejects.toMatchObject({
      name: 'HttpValidationError',
      context: 'GET /posts/3',
    });
  });

  it('leaves a transport failure as-is instead of reporting it as a validation error', async () => {
    const schema = z.object({ id: z.number() });
    mock.onGet('/posts/500').reply(500);

    await expect(httpClient.get('/posts/500', { responseSchema: schema })).rejects.not.toBeInstanceOf(
      HttpValidationError,
    );
  });

  it('validates the response body for post the same way as for get', async () => {
    const schema = z.object({ id: z.number(), title: z.string() });
    mock.onPost('/posts').reply(201, { id: 5, title: 'created' });

    const result = await httpClient.post('/posts', { title: 'created' }, { responseSchema: schema });

    expect(result).toEqual({ id: 5, title: 'created' });
  });

  it('validates the response body for put the same way as for get', async () => {
    const schema = z.object({ id: z.number(), title: z.string() });
    mock.onPut('/posts/6').reply(200, { id: 6, title: 'updated' });

    const result = await httpClient.put('/posts/6', { title: 'updated' }, { responseSchema: schema });

    expect(result).toEqual({ id: 6, title: 'updated' });
  });

  it('names put in the validation context so a failure points at the right call', async () => {
    const schema = z.object({ id: z.number() });
    mock.onPut('/posts/7').reply(200, { id: 'not-a-number' });

    await expect(httpClient.put('/posts/7', {}, { responseSchema: schema })).rejects.toMatchObject({
      context: 'PUT /posts/7',
    });
  });

  it('validates the response body for delete the same way as for get', async () => {
    const schema = z.object({ deleted: z.boolean() });
    mock.onDelete('/posts/8').reply(200, { deleted: true });

    const result = await httpClient.delete('/posts/8', { responseSchema: schema });

    expect(result).toEqual({ deleted: true });
  });

  it('names delete in the validation context so a failure points at the right call', async () => {
    const schema = z.object({ deleted: z.boolean() });
    mock.onDelete('/posts/9').reply(200, { deleted: 'yes' });

    await expect(httpClient.delete('/posts/9', { responseSchema: schema })).rejects.toMatchObject({
      context: 'DELETE /posts/9',
    });
  });

  it('forwards the abort signal so axios cancels the request rather than failing some other way', async () => {
    const controller = new AbortController();
    mock.onGet('/posts/4').reply(() => {
      controller.abort();

      return [200, { id: 4, title: 'too late' }];
    });

    const error = await httpClient.get('/posts/4', { signal: controller.signal }).catch((reason: unknown) => reason);

    expect(isCancel(error)).toBe(true);
    expect(controller.signal.aborted).toBe(true);
  });
});
