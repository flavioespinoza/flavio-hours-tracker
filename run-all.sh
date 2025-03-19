#!/bin/bash

# Check if a date argument is passed
START_DATE=$1

# Update the path to the get-flavio-hours.sh script
bash /Users/flavio/xmen/flavio-hours-old/get-flavio-hours.sh "$START_DATE"

# Check if the CSV file was generated
current_year=$(date +"%Y")
current_month=$(date +"%b" | tr '[:upper:]' '[:lower:]')
last_month=$(date -v-1m +"%b" | tr '[:upper:]' '[:lower:]')
CSV_FILE="/Users/flavio/xmen/flavio-hours-old/flavio-hours-${current_year}-${last_month}-${current_month}.csv"

if [ ! -f "$CSV_FILE" ]; then
  echo "Error: CSV file not found. Ensure get-flavio-hours.sh generates the file."
  exit 1
fi

# Run calculateTimePerDayAndRepo.ts
node /Users/flavio/xmen/flavio-hours-old/calculateTimePerDayAndRepo.ts "$CSV_FILE"
