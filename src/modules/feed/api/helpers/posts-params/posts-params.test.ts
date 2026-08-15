import { buildPostsParams } from './posts-params.helper';

describe('buildPostsParams', () => {
  it('always sends _page and _limit taken from the page argument', () => {
    expect(buildPostsParams({ page: 2, limit: 10 }, {})).toEqual({ _page: 2, _limit: 10 });
  });

  it('includes q and userId when both filters are supplied', () => {
    expect(buildPostsParams({ page: 1, limit: 5 }, { q: 'hello', userId: 5 })).toEqual({
      _page: 1,
      _limit: 5,
      q: 'hello',
      userId: 5,
    });
  });

  it('omits q when it is an empty string', () => {
    expect(buildPostsParams({ page: 1, limit: 5 }, { q: '' })).toEqual({ _page: 1, _limit: 5 });
  });

  it('omits userId when it is undefined but keeps a supplied q', () => {
    expect(buildPostsParams({ page: 1, limit: 5 }, { q: 'only-q', userId: undefined })).toEqual({
      _page: 1,
      _limit: 5,
      q: 'only-q',
    });
  });

  it('keeps userId 0 because the guard tests for undefined rather than falsiness', () => {
    expect(buildPostsParams({ page: 1, limit: 5 }, { userId: 0 })).toEqual({ _page: 1, _limit: 5, userId: 0 });
  });
});
