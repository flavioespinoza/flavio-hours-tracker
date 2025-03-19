## flavio-hours-tracker

Estimates your hours worked over the last 40 days by pulling your commits from your local github projects folder.

### Steps to Use

1. **Clone the Repository**  
   Open your terminal and run the following command to clone the repository:
   ```bash
   git clone https://github.com/flavioespinoza/flavio-hours-tracker.git
   cd flavio-hours-tracker
   ```

2. **Install Dependencies**  
   Ensure you have [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/) installed. Then, run:
   ```bash
   yarn install
   ```

3. **Run the Script**  
   Execute the `run-all.sh` script with `yarn calc` to generate and process the CSV file:
   ```bash`
   yarn calc
   ```

4. **View the Output**  
   The final formatted CSV file will be saved in the same directory with a name like `flavio-hours-<year>-<last_month>-<this_month>_calc.csv`.
