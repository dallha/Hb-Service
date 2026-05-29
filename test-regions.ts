import { Client } from 'pg';

const regions = [
  'eu-west-3',
  'eu-west-2',
  'eu-west-1',
  'eu-central-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ap-southeast-1'
];

async function testRegions() {
  for (const region of regions) {
    const url = `postgresql://postgres.fagefjihggrzfxqdouys:q1KNFreU9NfAvfcA@aws-0-${region}.pooler.supabase.com:6543/postgres`;
    const client = new Client({ 
      connectionString: url,
      ssl: { rejectUnauthorized: false }
    });
    try {
      console.log(`Testing ${region}...`);
      await client.connect();
      console.log(`✅ SUCCESS on ${region}!`);
      await client.end();
      return;
    } catch (e: any) {
      console.log(`❌ FAILED on ${region}: ${e.message}`);
    }
  }
}

testRegions();
