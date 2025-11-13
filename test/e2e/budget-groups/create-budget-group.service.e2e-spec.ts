import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { closeE2eApp, createE2eTestContext } from '../utils/e2e-test-context';

describe('BudgetGroups - Create BudgetGroup (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const context = await createE2eTestContext();
    app = context.app;
  });

  afterAll(async () => {
    await closeE2eApp(app);
  });

  const server = () => request(app.getHttpServer());

  it('bootstraps the e2e app for creating budget groups (placeholder)', () => {
    expect(server).toBeDefined();
  });
});
