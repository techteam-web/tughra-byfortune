import http from 'node:http'
import fs from 'node:fs'
const out = process.argv[2], dbg = process.argv[3]
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Headers', '*')
  if (req.method === 'OPTIONS') return res.end()
  const name = decodeURIComponent(req.url.slice(1)); const chunks = []
  req.on('data', c => chunks.push(c)); req.on('end', () => {
    const dir = name.startsWith('dbg-') ? dbg : out
    fs.writeFileSync(dir + '/' + name, Buffer.concat(chunks)); res.end('ok')
  })
}).listen(5300)
