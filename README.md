## flavio-hours-tracker

Estimates your hours worked over the last 40 days by pulling your commits from your local GitHub projects folder.

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

3. **Update Your `.zshrc` File**  
   To make the `BASE_DIR` environment variable persistent, you can add it to your `.zshrc` file:
   - Open your `.zshrc` file in VS Code:
     ```bash
     code ~/.zshrc
     ```
   - Add the following line to set the `BASE_DIR`:
     ```bash
     export BASE_DIR=<your_directory>
     ```
   - Save the file and close VS Code.

   After updating, make sure to source the `.zshrc` file to apply the changes:
   ```bash
   source ~/.zshrc
   ```

4. **Run the Script** 


   **Option 1**
   
   Run the script with yarn.
   ```bash
   yarn calc
   ```
   
   **Option 2**

   Execute the following command to generate and process the CSV file. By default, it processes repositories in the `~/bless` directory. You can override this by setting the `BASE_DIR` environment variable:
   ```bash
   BASE_DIR=<your_directory> yarn calc
   ```

5. **View the Output**  
   The final formatted CSV file will be saved in the same directory with a name like `flavio-hours-<year>-<last_month>-<this_month>.csv`.
