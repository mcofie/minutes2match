const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://ziglffbvcexvwguqopqm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppZ2xmZmJ2Y2V4dndndXFvcHFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDcyMzQ4NCwiZXhwIjoyMDc2Mjk5NDg0fQ.6aWLTmoGQZuIbY4IX02SbvIbrQuzrPvfNkfERqqHAXo');

async function test() {
  const { data, error } = await supabase.schema('m2m').from('profiles').select('id, display_name, gender, interested_in').limit(10);
  console.log(data);
}
test();
