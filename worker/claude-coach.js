/**
 * SUCCESS OS — Claude Coach Proxy (Cloudflare Worker)
 *
 * Deploy:
 *   1. wrangler deploy  (or paste into dash.cloudflare.com/workers)
 *   2. wrangler secret put ANTHROPIC_API_KEY   ← your key from console.anthropic.com
 *   3. Copy the worker URL → ProfileScreen → AI Coach URL
 *
 * Free tier: 100,000 requests/day — more than enough.
 */

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors })
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 })
    }

    let prompt
    try {
      const body = await request.json()
      prompt = body?.prompt
      if (!prompt) throw new Error('missing prompt')
    } catch {
      return new Response(JSON.stringify({ error: 'invalid body' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const anthropic = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 250,
        messages:   [{ role: 'user', content: prompt }],
      }),
    })

    if (!anthropic.ok) {
      return new Response(JSON.stringify({ error: 'upstream error' }), {
        status: 502, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const data    = await anthropic.json()
    const response = data?.content?.[0]?.text ?? ''

    return new Response(JSON.stringify({ response }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  },
}
