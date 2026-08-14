export type DataSource = 'http' | 'asyncStorage';

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
