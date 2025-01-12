import { Test, TestingModule } from '@nestjs/testing';
import { TestDatabaseModule } from './database-testing.module';

export async function createTestingModule(
  imports: any[] = [],
  overrideProviders: Array<{
    provider: any;
    useValue: any;
  }> = []
) {
  const testingModuleBuilder = Test.createTestingModule({
    imports: [TestDatabaseModule, ...imports],
  });

  // Apply any provider overrides
  for (const override of overrideProviders) {
    testingModuleBuilder.overrideProvider(override.provider)
      .useValue(override.useValue);
  }

  return testingModuleBuilder.compile();
}