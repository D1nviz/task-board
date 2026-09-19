const TEST_DATABASE_SUFFIX = "_test";

export const resolveTestDatabase = ({
  databaseUrl,
}: {
  databaseUrl: string;
}) => {
  const url = new URL(databaseUrl);
  const baseName = url.pathname.slice(1);
  const testName = `${baseName}${TEST_DATABASE_SUFFIX}`;

  url.pathname = `/${testName}`;

  return { testName, testUrl: url.toString() };
};
