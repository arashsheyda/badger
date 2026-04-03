export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const username = String(query.username || '').trim().replace(/^@/, '')

  if (!username || !/^[a-zA-Z0-9-]+$/.test(username)) {
    throw createError({ statusCode: 400, message: 'Invalid username' })
  }

  const html = await $fetch<string>(`https://github.com/users/${encodeURIComponent(username)}/contributions`, {
    headers: { Accept: 'text/html' },
  })

  // Parse data-level attributes from the contribution calendar table cells
  const levels: number[] = []
  const regex = /data-level="(\d)"/g
  let match = regex.exec(html)
  while (match) {
    levels.push(Number(match[1]))
    match = regex.exec(html)
  }

  return { username, levels }
})
