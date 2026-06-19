import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface AIConfig {
  baseUrl: string;
  model: string;
  apiKey: string;
}

export interface AIConfigPublic {
  baseUrl: string;
  model: string;
  apiKeyMasked: string;
  hasKey: boolean;
}

const DEFAULTS: Record<string, string> = {
  ai_base_url: "https://api.novimundi.space/v1",
  ai_model:    "claude-haiku-4-5",
  ai_api_key:  "",
};

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private async get(key: string): Promise<string> {
    const row = await this.prisma.settings.findUnique({ where: { key } });
    return row?.value ?? DEFAULTS[key] ?? "";
  }

  private async set(key: string, value: string): Promise<void> {
    await this.prisma.settings.upsert({
      where:  { key },
      update: { value },
      create: { key, value },
    });
  }

  async getAIConfig(): Promise<AIConfig> {
    const [baseUrl, model, apiKey] = await Promise.all([
      this.get("ai_base_url"),
      this.get("ai_model"),
      this.get("ai_api_key"),
    ]);
    return { baseUrl, model, apiKey };
  }

  async getAIConfigPublic(): Promise<AIConfigPublic> {
    const { baseUrl, model, apiKey } = await this.getAIConfig();
    const apiKeyMasked = apiKey.length > 8
      ? `${apiKey.slice(0, 7)}…${apiKey.slice(-4)}`
      : apiKey.length > 0 ? "••••••••" : "";
    return { baseUrl, model, apiKeyMasked, hasKey: apiKey.length > 0 };
  }

  async updateAIConfig(data: Partial<{ baseUrl: string; model: string; apiKey: string }>) {
    const ops: Promise<void>[] = [];
    if (data.baseUrl  !== undefined) ops.push(this.set("ai_base_url", data.baseUrl));
    if (data.model    !== undefined) ops.push(this.set("ai_model",    data.model));
    if (data.apiKey   !== undefined) ops.push(this.set("ai_api_key",  data.apiKey));
    await Promise.all(ops);
    return this.getAIConfigPublic();
  }
}
