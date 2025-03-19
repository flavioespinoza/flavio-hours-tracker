import fs from 'fs'
import path from 'path'

const OUTPUT_FILE = 'project-code.md' // Output markdown file
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', 'out'] // Exclude common directories
const EXCLUDE_FILES = ['collect-code.ts'] // Exclude this script itself
const VALID_FILES = ['package.json'] // Files to always include
const VALID_EXTENSIONS = ['.ts', '.sh'] // Only include these extensions

// Function to get all files recursively
const getFiles = (dir: string): string[] => {
	const files = fs.readdirSync(dir)
	let result: string[] = []

	files.forEach((file) => {
		const filePath = path.join(dir, file)
		const stat = fs.statSync(filePath)

		if (stat.isDirectory() && !EXCLUDE_DIRS.includes(file)) {
			result = result.concat(getFiles(filePath)) // Recursively get files
		} else if (
			stat.isFile() &&
			(VALID_EXTENSIONS.includes(path.extname(file)) || VALID_FILES.includes(file)) &&
			!EXCLUDE_FILES.includes(file)
		) {
			result.push(filePath)
		}
	})

	return result
}

// Function to collect and write code into a .md file
const collectCode = () => {
	const allFiles = getFiles(process.cwd()) // Get all files in the project directory
	let markdownContent = '# Project Code Collection\n\n'

	allFiles.forEach((file) => {
		const ext = path.extname(file).slice(1) || 'json' // Set 'json' for package.json
		const code = fs.readFileSync(file, 'utf8')

		markdownContent += `## ${file}\n\n\`\`\`${ext}\n${code}\n\`\`\`\n\n`
	})

	fs.writeFileSync(OUTPUT_FILE, markdownContent, 'utf8')
	console.log(`✅ Code collected and saved in ${OUTPUT_FILE}`)
}

// Run the function
collectCode()
