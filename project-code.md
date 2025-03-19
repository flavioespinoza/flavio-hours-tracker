# Project Code Collection

Based on the code snippets provided, here's a description of what this project does:

This project, called "flavio-hours-tracker", is a time-tracking tool designed to analyze Git commits across multiple repositories and generate a comprehensive report of work hours. Here's a 
directory structure and a breakdown of its main functions:

Directory tree:

```shell
.
├── get-flavio-hours.sh
├── calculateTimePerDayAndRepo.ts
├── run-all.sh
└── package.json
```


1. Data Collection: The `get-flavio-hours.sh` script scans through all Git repositories in a specified directory (~/bless), collecting commit information from the last 30 days. It compiles this data into a CSV file with details like repository name, commit date, time, and commit message.

2. Data Processing: The `calculateTimePerDayAndRepo.ts` script takes the generated CSV file as input and processes it to calculate the total work hours per day and per repository. It groups commits, handles time calculations, and formats tasks.

3. Report Generation: The script generates a new CSV file with a summary of work hours, including date, repository, tasks performed, and total hours worked. It rounds up time to the nearest quarter-hour and formats tasks for readability.

4. Automation: The `run-all.sh` script automates the entire process, running both the data collection and processing scripts in sequence.

## Run Project

To run the main calculation script:
```shell
yarn calc
```

This is the most relevant command for the project's main functionality. It will execute the run-all.sh script, which in turn runs both the data collection (get-flavio-hours.sh) and data processing (calculateTimePerDayAndRepo.ts) scripts.

## Issue that needs solution

1. We need to pass and a start-date to the run-all.sh and then to the get-flavio-hours.sh. 
1. This will set the date range from the start-date +32 days.
1. The user can enter a UK format date or a US format date as shown below.

```sh
# ✅ UK Format (DD/MM/YYYY)
yarn calc 14/02/2025  # Converted to 2025-02-14

# ✅ US Format (MM/DD/YYYY)
yarn calc 02/14/2025  # Converted to 2025-02-14

```

I imagine the date will be passed to this part of the get-hours-flavio.sh 

```sh
    # Run git log and append to the CSV file
    if ! git log --all --since="30 days ago" --pretty=format:"$repo_name,%ad,%s" 
```

## /Users/flavio/bless/flavio-hours-old/calculateTimePerDayAndRepo.ts

```ts



import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';
import { parse as csvParse } from 'csv-parse/sync'; // Install this package if not already installed
import { fileURLToPath } from 'url';

// Derive __dirname for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type CommitEntry = {
  repo: string;
  date: string;
  time: string;
  task: string;
};

type GroupedCommits = {
  [date: string]: {
    [repo: string]: { timestamps: Date[]; tasks: string[] };
  };
};

// Function to round up minutes to the nearest quarter-hour
const roundUpToQuarterHour = (minutes: number): number => Math.ceil(minutes / 15) * 15;

// Function to get the formatted filename
const getFormattedFilename = (): string => {
  const now = new Date();
  const currentYear = format(now, 'yyyy');
  const lastMonth = format(new Date(now.setMonth(now.getMonth() - 1)), 'MMM').toLowerCase();
  const currentMonth = format(new Date(), 'MMM').toLowerCase();
  return `flavio-hours-${currentYear}-${lastMonth}-${currentMonth}_calc.csv`;
};

// Function to group commits by date and repo
const groupByDateAndRepo = (entries: CommitEntry[]) => {
  const grouped: GroupedCommits = {};

  entries.forEach(({ repo, date, time, task }) => {
    const timestamp = new Date(`${date}T${time}`);

    if (!grouped[date]) {
      grouped[date] = {};
    }

    if (!grouped[date][repo]) {
      grouped[date][repo] = { timestamps: [], tasks: [] };
    }

    // Only add unique timestamps
    if (!grouped[date][repo].timestamps.some((t) => t.getTime() === timestamp.getTime())) {
      grouped[date][repo].timestamps.push(timestamp);
    }

    // Append task in order
    grouped[date][repo].tasks.push(task);
  });

  return grouped;
};

// Function to clean and format tasks
const cleanAndFormatTasks = (tasks: string[]): string[] => {
  const uniqueTasks = Array.from(new Set(tasks)); // Remove duplicates
  return uniqueTasks.map((task) => {
    // Replace underscores with spaces and capitalize the first letter
    let formattedTask = task.replace(/_/g, ' ').trim();
    formattedTask = formattedTask.charAt(0).toUpperCase() + formattedTask.slice(1);

    // Add a period at the end if not already present
    if (!formattedTask.endsWith('.')) {
      formattedTask += '.';
    }

    return `• ${formattedTask}`;
  });
};

// Function to calculate total time per day and repo, then save CSV
const calculateTimePerDayAndRepo = (entries: CommitEntry[]) => {
  const groupedCommits = groupByDateAndRepo(entries);
  let timePerDayRepo: { date: string; repo: string; tasks: string; hours: number }[] = [];

  Object.entries(groupedCommits).forEach(([date, repos]) => {
    Object.entries(repos).forEach(([repo, { timestamps, tasks }]) => {
      timestamps.sort((a, b) => a.getTime() - b.getTime());

      let totalMinutes: number;
      if (timestamps.length === 1) {
        totalMinutes = 60; // Single timestamp counts as 1 hour
      } else {
        totalMinutes = (timestamps[timestamps.length - 1].getTime() - timestamps[0].getTime()) / 60000;
        totalMinutes = roundUpToQuarterHour(totalMinutes);
      }

      const totalHours = totalMinutes / 60; // Convert to float

      timePerDayRepo.push({
        date: format(new Date(date), 'MMM dd'), // Format date as "Feb 14"
        repo,
        tasks: cleanAndFormatTasks(tasks).join('\n'), // Clean and format tasks
        hours: parseFloat(totalHours.toFixed(2)) // Ensure float precision
      });
    });
  });

  // Sort by date ascending (oldest first)
  timePerDayRepo.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Generate the filename
  const filename = getFormattedFilename();
  const filePath = path.join(__dirname, filename); // Use derived __dirname

  // Write to CSV file
  const csvContent = [
    'Date,Repo,Tasks,Hours',
    ...timePerDayRepo.map((row) => `"${row.date}","${row.repo}","${row.tasks.replace(/"/g, '""')}",${row.hours}`) // Ensure Hours is a number
  ].join('\n');

  fs.writeFileSync(filePath, csvContent);

  // Return the CSV file link
  return `File generated: [Download ${filename}](sandbox:/${filename})`;
};

// Function to read and parse the CSV file
const parseCSVFile = (filePath: string): CommitEntry[] => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = csvParse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  return records.map((record: any) => ({
    repo: record.repo,
    date: record.date,
    time: record.time,
    task: record.task,
  }));
};

// Main function to run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  const inputFilePath = process.argv[2]; // Get the file path from command-line arguments

  if (!inputFilePath) {
    console.error('Please provide the input CSV file path as the first argument.');
    process.exit(1);
  }

  try {
    const entries = parseCSVFile(inputFilePath);
    const result = calculateTimePerDayAndRepo(entries);
    console.log(result);
  } catch (error) {
    console.error('Error processing the file:', error.message);
    process.exit(1);
  }
}

export default calculateTimePerDayAndRepo;




```

## /Users/flavio/bless/flavio-hours-old/get-flavio-hours.sh

```sh



#!/bin/bash

# Get current date information
current_year=$(date +"%Y")
current_month=$(date +"%b" | tr '[:upper:]' '[:lower:]')
last_month=$(date -v-1m +"%b" | tr '[:upper:]' '[:lower:]')

# Define the output file with dynamic name
output_file="/Users/flavio/bless/flavio-hours-old/flavio-hours-${current_year}-${last_month}-${current_month}.csv"

# Ensure the output file exists and has the header
mkdir -p "/Users/flavio/bless/flavio-hours"  # Ensure the directory exists
if ! echo "repo,date,time,task,author" > "$output_file"; then
    echo "Error: Failed to create output file $output_file" >&2
    exit 1
fi

# Function to process each repository
process_repo() {
    local repo_path="$1"
    local repo_name=$(basename "$repo_path")
    
    echo "Processing $repo_name..." >&2
    
    # Change to the repository directory
    if ! cd "$repo_path"; then
        echo "Error: Failed to access repository $repo_path" >&2
        return
    fi
    
    # Run git log and append to the CSV file
    if ! git log --all --since="30 days ago" --pretty=format:"$repo_name,%ad,%s" --date=format:"%Y-%m-%d,%H:%M:%S" | 
    while IFS=',' read -r repo date time message; do
        echo "$repo,$date,$time,\"$message\"" >> "$output_file"
    done; then
        echo "Warning: No commits found for $repo_name or failed to process Git log" >&2
    fi
}

# Iterate through all directories in ~/bless
for dir in ~/bless/*/; do
    if [ -d "$dir/.git" ]; then
        process_repo "$dir"
    fi
done

# Check if the output file has content beyond the header
if [ $(wc -l < "$output_file") -le 1 ]; then
    echo "Error: No data was written to $output_file" >&2
    exit 1
fi

# Only output the file path
echo "$output_file"




```

## /Users/flavio/bless/flavio-hours-old/package.json

```json
{
	"name": "flavio-hours-tracker",
	"version": "1.0.0",
	"description": "A script to process Git commits and generate a time-tracking CSV.",
	"main": "index.ts",
	"type": "module",
	"scripts": {
		"start": "ts-node index.ts",
		"build": "tsc",
		"lint": "eslint . --ext .ts",
		"format": "prettier --write .",
		"calc": "bash run-all.sh"
	},
	"dependencies": {
		"csv-parse": "^5.3.6",
		"date-fns": "^3.6.0"
	},
	"devDependencies": {
		"@types/node": "^22.13.10",
		"eslint": "^8.55.0",
		"eslint-config-prettier": "^9.1.0",
		"eslint-plugin-prettier": "^5.1.3",
		"prettier": "^3.1.0",
		"ts-node": "^10.9.2",
		"typescript": "^5.8.2"
	},
	"engines": {
		"node": ">=18.0.0",
		"yarn": ">=1.22.0"
	},
	"license": "MIT"
}

```

## /Users/flavio/bless/flavio-hours-old/run-all.sh

```sh
#!/bin/bash

# Run get-flavio-hours.sh
bash /Users/flavio/bless/flavio-hours-old/get-flavio-hours.sh

# Check if the CSV file was generated
current_year=$(date +"%Y")
current_month=$(date +"%b" | tr '[:upper:]' '[:lower:]')
last_month=$(date -v-1m +"%b" | tr '[:upper:]' '[:lower:]')
CSV_FILE="/Users/flavio/bless/flavio-hours-old/flavio-hours-${current_year}-${last_month}-${current_month}.csv"

if [ ! -f "$CSV_FILE" ]; then
  echo "Error: CSV file not found. Ensure get-flavio-hours.sh generates the file."
  exit 1
fi

# Run calculateTimePerDayAndRepo.ts
node /Users/flavio/bless/flavio-hours-old/calculateTimePerDayAndRepo.ts "$CSV_FILE"

```
