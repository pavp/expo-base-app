import { createFeedGateway } from './index';

describe('createFeedGateway', () => {
  it('returns the http gateway for the "http" data source', () => {
    const gateway = createFeedGateway('http');

    expect(gateway.getSourceInfo().type).toBe('http');
  });

  it('returns the asyncStorage gateway for the "asyncStorage" data source', () => {
    const gateway = createFeedGateway('asyncStorage');

    expect(gateway.getSourceInfo().type).toBe('asyncStorage');
  });

  it('defaults to the http gateway when no data source is supplied', () => {
    const gateway = createFeedGateway();

    expect(gateway.getSourceInfo().type).toBe('http');
  });

  it('returns gateways with an identical call signature regardless of the active data source', () => {
    const httpGateway = createFeedGateway('http');
    const asyncStorageGateway = createFeedGateway('asyncStorage');

    expect(typeof httpGateway.findPosts).toBe('function');
    expect(typeof httpGateway.findPostById).toBe('function');
    expect(typeof httpGateway.findCommentsByPostId).toBe('function');
    expect(typeof asyncStorageGateway.findPosts).toBe('function');
    expect(typeof asyncStorageGateway.findPostById).toBe('function');
    expect(typeof asyncStorageGateway.findCommentsByPostId).toBe('function');
  });
});
