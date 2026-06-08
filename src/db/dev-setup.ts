import { execSync } from 'child_process';

// // Load .env.local
// try {
//   const envPath = resolve(process.cwd(), '.env.local');
//   const envContent = readFileSync(envPath, 'utf-8');
//   for (const line of envContent.split('\n')) {
//     const match = line.match(/^([^#=]+)=(.*)$/);
//     if (match) {
//       const key = match[1].trim();
//       const value = match[2].trim().replace(/^["']|["']$/g, '');
//       if (!process.env[key]) {
//         process.env[key] = value;
//       }
//     }
//   }
// } catch {
//   // .env.local not found, rely on existing env vars
// }

function runStep(name: string, command: string): void {
  console.log(`\n=== ${name} ===`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`=== ${name} completed ===\n`);
  } catch {
    console.error(`\n!!! ${name} FAILED !!!`);
    console.error(`Command: ${command}`);
    process.exit(1);
  }
}

function runStepAllowFailure(name: string, command: string): void {
  console.log(`\n=== ${name} ===`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`=== ${name} completed ===\n`);
  } catch {
    console.warn(`\n!!! ${name} FAILED (continuing anyway) !!!\n`);
  }
}

runStepAllowFailure('DB: Migrate', 'npx tsx src/db/migrate.ts');
runStepAllowFailure('DB: Seed', 'npx tsx src/db/seed.ts');
runStep('Next.js Dev', 'npx next dev');
