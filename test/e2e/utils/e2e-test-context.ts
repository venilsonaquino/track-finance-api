import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';

export interface E2eTestContext {
  app: INestApplication;
  httpServer: unknown;
}

export async function createE2eTestContext(): Promise<E2eTestContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  return {
    app,
    httpServer: app.getHttpServer(),
  };
}

export async function closeE2eApp(app?: INestApplication) {
  if (app) {
    await app.close();
  }
}
