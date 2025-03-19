## flavio-hours-tracker

Calculator hours by pulling your commits from your local get a project folder for the last 30 days.

### Steps to Use

1. **Clone the Repository**  
   Open your terminal and run the following command to clone the repository:
   ```bash
   git clone <repository-url>
   cd flavio-hours-tracker
   ```

2. **Install Dependencies**  
   Ensure you have [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/) installed. Then, run:
   ```bash
   yarn install
   ```

3. **Run the Script**  
   Execute the `run-all.sh` script to generate and process the CSV file:
   ```bash
   bash run-all.sh
   ```

4. **View the Output**  
   The final formatted CSV file will be saved in the same directory with a name like `flavio-hours-<year>-<last_month>-<this_month>_calc.csv`.



echo "# flavio-hours-tracker" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/flavioespinoza/flavio-hours-tracker.git
git push -u origin main
