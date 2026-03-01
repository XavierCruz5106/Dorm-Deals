const { createClient } = require('@supabase/supabase-js');

(async () => {
  const supabaseUrl = 'https://uqqlmywgfuzszhcvethn.supabase.co/';
  const supabaseKey = 'sb_secret_xi3GNMR-bGYc_h3pujQO8g_pNxFVPyM';
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('supabase url', supabaseUrl);
  const { data: convs, error: convErr } = await supabase
    .from('conversations')
    .select('*')
    .limit(1);
  if (convErr) {
    console.error('fetch conv error', convErr);
    process.exit(1);
  }
  console.log('convs', convs);
  if (!convs || convs.length === 0) {
    console.error('no conversation exists');
    process.exit(1);
  }
  const convId = convs[0].id;
  console.log('using conversation', convId);

  const { data, error: insertError, status, statusText } = await supabase
    .from('messages')
    .insert({ conversation_id: convId, sender_id: 'test', content: 'hello' })
    .select()
    .single();

  console.log('insert result', { data, insertError, status, statusText });
})();
