import { createWriteStream } from 'node:fs'
import { mkdir, readFile, rename, rm } from 'node:fs/promises'
import { get } from 'node:https'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const CORE_URL =
  'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js'
const __dirname = dirname(fileURLToPath(import.meta.url))
const outputPath = join(
  __dirname,
  '..',
  'public',
  'live2d',
  'runtime',
  'live2dcubismcore.min.js',
)
const temporaryPath = `${outputPath}.tmp`

async function downloadFile(url, destination) {
  await mkdir(dirname(destination), { recursive: true })

  await new Promise((resolve, reject) => {
    const request = get(url, (response) => {
      if (
        response.statusCode &&
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        response.resume()
        downloadFile(response.headers.location, destination).then(resolve, reject)
        return
      }

      if (response.statusCode !== 200) {
        response.resume()
        reject(new Error(`Unexpected response ${response.statusCode} from ${url}`))
        return
      }

      const file = createWriteStream(destination)
      response.pipe(file)
      file.on('finish', () => {
        file.close(resolve)
      })
      file.on('error', reject)
    })

    request.on('error', reject)
    request.setTimeout(30_000, () => {
      request.destroy(new Error('Timed out downloading Live2D Cubism Core.'))
    })
  })
}

async function verifyDownloadedCore(path) {
  const content = await readFile(path, 'utf8')

  if (
    !content.includes('Live2D Cubism Core') ||
    !content.includes('Redistributable Code') ||
    !content.includes('Live2DCubismCore')
  ) {
    throw new Error('Downloaded file does not look like Live2D Cubism Core.')
  }
}

try {
  await rm(temporaryPath, { force: true })
  await downloadFile(CORE_URL, temporaryPath)
  await verifyDownloadedCore(temporaryPath)
  await rename(temporaryPath, outputPath)
  console.log(`Saved Live2D Cubism Core to ${outputPath}`)
  console.log('Do not commit this file unless your team has reviewed the Live2D license.')
} catch (error) {
  await rm(temporaryPath, { force: true })
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
