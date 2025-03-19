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

  // Sort by date descending (most recent first)
  timePerDayRepo.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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