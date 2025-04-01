import fs from "node:fs"
import { fileURLToPath } from "node:url"
import { join } from "node:path"
import { Buffer } from "node:buffer"
import { consola } from "consola"

const projectDir = fileURLToPath(new URL("..", import.meta.url))
const iconsDir = join(projectDir, "public", "icons")

async function downloadImage(url: string, outputPath: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`could not fetch ${url}, status: ${response.status}`)
    }

    const image = await response.arrayBuffer()
    fs.writeFileSync(outputPath, Buffer.from(image))
    consola.success(`Logo downloaded successfully to ${outputPath}`)
  } catch (error) {
    consola.error(`Error downloading the logo: `, error)
  }
}

async function main() {
  const url = "https://eu-images.contentstack.com/v3/assets/blt740a130ae3c5d529/blt8d5417b628e6b04b/656f5ed8485fda040aba11a1/Game_Developer_Logo_RGB_1.png?width=476&auto=webp&quality=80&disable=upscale"
  const outputPath = join(iconsDir, "gamedev.png")

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true })
  }

  await downloadImage(url, outputPath)
}

main()
