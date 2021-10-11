const environments = [
  'production',
  'staging',
  'development',
  'dev-local',
  'test'
] as const;

export type Environment = typeof environments[number];
export default environments;
