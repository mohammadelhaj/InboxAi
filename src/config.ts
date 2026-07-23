function required(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: required("NODE_ENV"),
  openaiApiKey: required("OPENAI_API_KEY"),
};