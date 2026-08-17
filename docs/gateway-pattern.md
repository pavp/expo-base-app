# Gateway Pattern

The Gateway Pattern provides an abstraction layer between the application logic and external data sources, enabling
the same feature to be served by a network API, a local cache, or fixture data without any change above the gateway.

## Purpose

- **Source abstraction**: hide whether data came from the network, disk, or memory
- **Runtime substitution**: choose the source per call rather than per build
- **Offline capability**: serve a local source when the network is unavailable
- **Testability**: replace the transport without mocking the module system
- **Uniform shape**: every source returns the same domain type, so callers branch on data, not on provenance

## When Not to Use It

A gateway earns its place when there is a decision to make. With exactly one data source there is no decision, and the
layer becomes an interface with one implementation, a factory with one branch, and a key segment with one value.

In that case the options builder calls the api layer directly and the `gateways/` folder does not exist. Add the layer
when the second source arrives — that is a contained refactor, not a rewrite.

## Structure

```
repositories/<entity>/gateways/
├── <entity>.gateway.types.ts     # The contract every source satisfies
├── http-gateway/
│   ├── http-gateway.ts
│   └── http-gateway.test.ts
├── async-storage-gateway/
│   ├── async-storage-gateway.ts
│   ├── async-storage-gateway.constants.ts
│   └── helpers/
├── mock-gateway/
│   └── mock-gateway.ts
└── index.ts                      # The factory
```

## The Shared Contract

Every gateway extends a base contract that describes what a source can do, so a caller can ask before assuming:

```typescript
export type DataSource = 'http' | 'asyncStorage' | 'mock';

export interface GatewayOptions {
  signal?: AbortSignal;
}

export interface GatewayCapabilities {
  offline: boolean;
  realtime: boolean;
  persistence: boolean;
}

export interface GatewaySourceInfo {
  type: DataSource;
  name: string;
  capabilities: GatewayCapabilities;
}

export interface BaseGateway {
  getSourceInfo(): GatewaySourceInfo;
}
```

Declaring capabilities as data rather than as scattered conditionals is what lets a screen show an offline badge
without knowing which gateway it received.

## The Entity Contract

```typescript
export interface EntityGateway extends BaseGateway {
  findAll(filters: EntityFilters & { page: number; limit: number }, options?: GatewayOptions): Promise<Entity[]>;
  findById(id: string, options?: GatewayOptions): Promise<Entity>;
}
```

The contract returns **domain types**, never transport envelopes. A gateway that returned a response wrapper would
leak its transport into every consumer.

## Implementation Examples

### 1. HTTP Gateway

The network implementation delegates to the api layer, which owns schema validation:

```typescript
export const httpGateway: EntityGateway = {
  getSourceInfo: () => ({
    type: 'http',
    name: 'http',
    capabilities: { offline: false, realtime: false, persistence: true },
  }),

  findAll: (filters, options) => entityApi.getAll(filters, options),
  findById: (id, options) => entityApi.getById(id, options),
};
```

Thin on purpose. Transport configuration belongs in the client, validation in the api layer, caching in the
repository — the gateway only maps a contract onto a source.

### 2. Local Storage Gateway

The offline implementation reads from device storage and must handle what the network implementation never sees — a
key that was never written:

```typescript
export const asyncStorageGateway: EntityGateway = {
  getSourceInfo: () => ({
    type: 'asyncStorage',
    name: 'asyncStorage',
    capabilities: { offline: true, realtime: false, persistence: true },
  }),

  findAll: async () => readStoredEntities(),

  findById: async (id) => {
    const entities = await readStoredEntities();
    const entity = entities.find((candidate) => candidate.id === id);

    if (!entity) {
      throw new Error(`Entity not found in local storage: ${id}`);
    }

    return entity;
  },
};
```

**Capabilities differ, and so does behaviour.** Local storage holds whatever was cached, so server-side filtering and
pagination have nothing to apply — this implementation deliberately ignores those arguments rather than pretending to
honour them. A gateway that silently returns unfiltered data while accepting a filter is worse than one that ignores
it openly.

### 3. Mock Gateway

Useful for development against an unfinished API and for tests that need deterministic data:

```typescript
export const mockGateway: EntityGateway = {
  getSourceInfo: () => ({
    type: 'mock',
    name: 'mock',
    capabilities: { offline: true, realtime: false, persistence: false },
  }),

  findAll: async (filters) => generateMockEntities(filters.limit),
  findById: async (id) => ({ ...mockEntity, id }),
};
```

## The Factory

One switch, one default, exhaustive:

```typescript
export const createEntityGateway = (source: DataSource = 'http'): EntityGateway => {
  switch (source) {
    case 'asyncStorage':
      return asyncStorageGateway;
    case 'mock':
      return mockGateway;
    case 'http':
    default:
      return httpGateway;
  }
};
```

The default keeps every existing call site working when a source is added, and typing the return as the interface
means a gateway missing a method fails to compile.

## Helper Functions

Storage access is extracted so both the read path and any future write path share one definition of the key and the
parse:

```typescript
export const readStoredEntities = async (): Promise<Entity[]> => {
  const raw = await getItem(ENTITY_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  return EntityArraySchema.parse(raw);
};
```

Stored data is validated on read, not trusted. A cache written by a previous version of the app can hold a shape the
current version no longer accepts.

## Usage in the Repository

The gateway is selected inside the query function, so the choice is per call:

```typescript
queryFn: ({ signal }) => createEntityGateway(dataSource).findAll(filters, { signal });
```

Nothing above this line knows which implementation answered.

## Benefits

### ✅ Advantages

- **Swappable at runtime** — offline mode is an argument, not a build
- **Isolated transport** — a client change touches one file
- **Testable without module mocking** — pass a different source
- **Declared capabilities** — behaviour differences are data, not folklore

### ⚠️ Trade-offs

- **An interface to keep in sync** — a new method means editing every implementation
- **Behavioural divergence** — sources cannot always honour the same arguments, which the contract cannot express
- **Unused branches rot** — an implementation nothing exercises drifts silently

## Testing Strategies

### 1. Test Each Implementation Against the Contract

```typescript
it('returns entities from the network', async () => {
  mock.onGet('entities').reply(200, [mockEntity]);

  const result = await httpGateway.findAll({ page: 1, limit: 10 });

  expect(result).toEqual([mockEntity]);
});

it('throws when a local entity is missing', async () => {
  await expect(asyncStorageGateway.findById('missing')).rejects.toThrow('not found in local storage');
});
```

### 2. Test the Factory's Mapping

```typescript
it('returns the local gateway for the async storage source', () => {
  expect(createEntityGateway('asyncStorage').getSourceInfo().type).toBe('asyncStorage');
});

it('defaults to the http gateway', () => {
  expect(createEntityGateway().getSourceInfo().type).toBe('http');
});
```

### 3. Use the Mock Gateway Above the Data Layer

When testing a business hook, pass the mock source instead of mocking the transport. The test then exercises the real
repository, the real keys, and the real builder.

## Related Patterns

- **[Repository Pattern](./repository-pattern.md)** - The layer that selects a gateway
- **[Module Architecture](./module-architecture.md)** - Where the data layer sits
- **[Testing](./testing.md)** - Mock levels by test type
