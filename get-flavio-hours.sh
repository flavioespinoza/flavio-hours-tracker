#!/bin/bash

# Get current date information
current_year=$(date +"%Y")
current_month=$(date +"%b" | tr '[:upper:]' '[:lower:]')
last_month=$(date -v-1m +"%b" | tr '[:upper:]' '[:lower:]')

# Define the output file with dynamic name
output_file="/Users/flavio/xmen/flavio-hours-old/flavio-hours-${current_year}-${last_month}-${current_month}.csv"

# Ensure the output file exists and has the header
mkdir -p "/Users/flavio/xmen/flavio-hours"  # Ensure the directory exists
if ! echo "date,time,task,author,repo" > "$output_file"; then
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

    # Run git log and process its output
    git log --all --since="40 days ago" --date=iso --pretty=format:"%ad|%s|%an" | 
    while IFS='|' read -r datetime message author; do
        # Extract date and time
        date=$(echo $datetime | cut -d' ' -f1)
        time=$(echo $datetime | cut -d' ' -f2 | cut -d'+' -f1)
        # Filter for specific authors
        if [[ "$author" == "Flavio Espinoza" || "$author" == "flavioespinoza" ]]; then
            echo "$date,$time,\"$message\",\"$author\",$repo_name" >> "$output_file"
        fi
    done

    if [ $? -ne 0 ]; then
        echo "Warning: Failed to process Git log for $repo_name" >&2
    fi
}

# Set the base directory for repositories, defaulting to "bless"
BASE_DIR="${BASE_DIR:-bless}"

# Iterate through all directories in the base directory
for dir in ~/"$BASE_DIR"/*/; do
    if [ -d "$dir/.git" ]; then
        process_repo "$dir"
    fi
done

# Check if the output file has content beyond the header
if [ $(wc -l < "$output_file") -le 1 ]; then
    echo "Error: No data was written to $output_file" >&2
    exit 1
fi

# Sort the CSV file by date (excluding the header)
header=$(head -n 1 "$output_file")
(echo "$header"; tail -n +2 "$output_file" | sort -t',' -k1,1r) > "${output_file}.tmp" && mv "${output_file}.tmp" "$output_file"

# Check if the sorting was successful
if [ $? -ne 0 ]; then
    echo "Error: Failed to sort the CSV file" >&2
    exit 1
fi

# Only output the file path
echo "$output_file"
