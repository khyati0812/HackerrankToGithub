🚀 Chrome Extension for Automated Code Push from HackerRank to GitHub

Overview
This Chrome Extension automates the process of pushing solutions directly from HackerRank to your GitHub repository. Upon successful submission of a solution on HackerRank, the extension extracts key details such as the problem title, programming language, and difficulty level (currently hardcoded), and categorizes the code into relevant folders in your GitHub repository.

Features
Dark/Light Mode: Toggle between dark and light modes for a comfortable user experience.
GitHub Authentication: Authenticate your GitHub account through the extension for secure access.
Repository Management: Link, create, or unlink GitHub repositories within the extension interface.
Automated Code Push: Automatically push solutions to GitHub upon successful submission on HackerRank.
Organized Structure: Solutions are categorized by difficulty level and programming language within the GitHub repository.

How It Works
Authenticate GitHub Account:
Upon installing the extension, authenticate your GitHub account through the extension interface.
Link GitHub Repository:
Choose an existing repository or create a new one directly from the extension interface. You can also unlink a repository if needed.
Navigate to HackerRank:
Once authenticated and linked to a repository, solve any challenge on HackerRank.
Automated Push to GitHub:
Upon successful submission, the extension will automatically extract relevant details (problem title, language, etc.) and push the solution to your GitHub repository.
The code is neatly organized into folders based on the difficulty level and programming language.

Challenges Faced
1. GitHub Authentication
Problem: Managing GitHub tokens, specifically the challenge of handling the transition between "access tokens" and "refresh tokens." Upon returning to the HackerRank page, the token would frequently be lost, preventing the solution from being pushed to GitHub.
Solution: Implementing session storage to store access tokens temporarily, combined with better error handling for token expiry.
2. Chrome Context Invalidated Error
Problem: When switching between HackerRank and the extension, the Chrome context would sometimes invalidate, breaking the connection and causing the code push to fail.
Solution: Leveraged Chrome's persistent background scripts and improved the message-passing mechanism between content scripts and background scripts to ensure that the context remains active.
3. Difficulty Level Extraction
Problem: Difficulty levels are not displayed on the same page where users submit solutions, leading to manual categorization in the code push.
Solution: Future work involves automating difficulty extraction by fetching data dynamically through API calls or background scripts, removing the need for hardcoding difficulty levels.
4. Element Identification
Problem: Precisely identifying elements like the problem title, programming language, and submission confirmation ("Congratulations" message) was challenging due to frequent DOM changes on HackerRank.
Solution: Used efficient class selectors and mutation observers to dynamically capture these elements upon each submission, reducing the chance of extraction failure.

Future Enhancements
Dynamic Difficulty Extraction: Automate the extraction of problem difficulty levels, eliminating the need for hardcoding.
Problem Statistics: Track and display statistics, such as the count of easy, medium, and hard problems solved by the user.
Public Chrome Web Store Launch: Plan to release the extension on the Chrome Web Store for public use.
Dynamic Variables: Replace hardcoded values with dynamic data fetching mechanisms.
UI Enhancements: Improve the UI by adding official HackerRank logos and making the interface more intuitive.
Error Handling Improvements: Enhance error handling to better manage situations where variables are accessed before the page has fully loaded.

Installation & Setup
Step 1: Clone the Repository
bash
Copy code
git clone https://github.com/your-username/chrome-extension-hackerrank-to-github.git
cd chrome-extension-hackerrank-to-github
Step 2: Add Extension to Chrome
Navigate to chrome://extensions/ in your Google Chrome browser.
Enable Developer mode in the top-right corner.
Click on Load unpacked and select the folder where you cloned this repository.
The extension will now appear in your Chrome toolbar.
Step 3: Authenticate and Link GitHub Repository
Click the extension icon in the Chrome toolbar.
Authenticate your GitHub account when prompted.
Choose a repository to link for automated code pushes, or create a new repository directly from the extension.
Step 4: Use the Extension
Solve any problem on HackerRank.
After successful submission, the extension will push the solution to your linked GitHub repository, organized by difficulty and language.
Resources
GitHub Authentication & Code Pushing: Helped with setting up GitHub API for authentication.
Chrome Extension Context Invalidation: StackOverflow solution for managing Chrome extension context issues.
GitHub API Authentication Documentation: Official documentation for GitHub authentication.
ChatGPT: Used for initial guidance and problem-solving.
Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes. Make sure your code follows the established guidelines and is well-documented.

License
This project is licensed under the MIT License. See the LICENSE file for more details.

Contact
For any queries or support, feel free to reach out at t-kchaudhary@microsoft.com.