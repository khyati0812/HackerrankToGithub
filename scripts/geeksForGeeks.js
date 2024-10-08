const codeLanguage = {
  C: '.c',
  'C++': '.cpp',
  'C#': '.cs',
  java: 'java',
  sql: 'sql',
  Python: '.py',
  Python3: '.py',
  JavaScript: '.js',
  Javascript: '.js',
};

let successfulSubmissionFlag = true;

const uploadToGitHubRepository = async (
  githubAccessToken,
  linkedRepository,
  solution,
  problemTitle,
  uploadFileName,
  sha,
  commitMessage,
  problemDifficulty
) => {
  const uploadPathURL = `https://api.github.com/repos/${linkedRepository}/contents/${problemDifficulty}/${problemTitle}/${uploadFileName}`;

  const uploadData = {
    message: commitMessage,
    content: solution, // Directly sending the solution without encoding
    sha,
  };

  const xhttp = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xhttp.onreadystatechange = function () {
      if (xhttp.readyState === 4) {
        if (xhttp.status === 200 || xhttp.status === 201) {
          const updatedSha = JSON.parse(xhttp.responseText).content.sha;

          // Update user statistics
          chrome.storage.local.get('userStatistics', (statistics) => {
            if (chrome.runtime.lastError) {
              console.error("Error accessing userStatistics:", chrome.runtime.lastError);
              return reject(new Error("Failed to access user statistics."));
            }

            let { userStatistics } = statistics;

            if (!userStatistics || Object.keys(userStatistics).length === 0) {
              userStatistics = {
                solved: 0,
                easy: 0,
                medium: 0,
                hard: 0,
                sha: {},
              };
            }

            const githubFilePath = problemTitle + uploadFileName;

            if (uploadFileName === 'README.md' && sha === null) {
              userStatistics.solved += 1;
              userStatistics.easy += problemDifficulty === 'Easy' ? 1 : 0;
              userStatistics.medium += problemDifficulty === 'Medium' ? 1 : 0;
              userStatistics.hard += problemDifficulty === 'Hard' ? 1 : 0;
            }

            userStatistics.sha[githubFilePath] = updatedSha;

            chrome.storage.local.set({ userStatistics }, () => {
              if (chrome.runtime.lastError) {
                console.error("Error setting userStatistics:", chrome.runtime.lastError);
                return reject(new Error("Failed to update user statistics."));
              }
              console.log(`${uploadFileName} - Commit Successful`);
              resolve(updatedSha);
            });
          });
        } else {
          reject(new Error(`Failed to upload: ${xhttp.statusText}`));
        }
      }
    };

    xhttp.open('PUT', uploadPathURL, true);
    xhttp.setRequestHeader('Authorization', `token ${githubAccessToken}`);
    xhttp.setRequestHeader('Accept', 'application/vnd.github.v3+json');
    xhttp.send(JSON.stringify(uploadData));
  });
};

async function uploadGitHub(
  solution,
  problemName,
  uploadFileName,
  commitMessage,
  problemDifficulty = null
) {
  // Ensure context is still valid before proceeding
  if (!chrome || !chrome.storage) {
    console.error("Chrome context invalidated.");
    return;
  }

  try {
    // Get the GitHub access token
    const accessToken = await new Promise((resolve, reject) => {
      chrome.storage.local.get('githubAccessToken', (result) => {
        if (chrome.runtime.lastError) {
          return reject(new Error('No GitHub access token found.'));
        }
        resolve(result.githubAccessToken);
      });
    });

    if (accessToken) {
      // Get the current phase
      const currentPhase = await new Promise((resolve) => {
        chrome.storage.local.get('current_phase', (result) => {
          resolve(result.current_phase);
        });
      });

      if (currentPhase === 'solve_and_push') {
        // Get the linked GitHub repository
        const linkedRepository = await new Promise((resolve) => {
          chrome.storage.local.get('github_LinkedRepository', (result) => {
            resolve(result.github_LinkedRepository);
          });
        });

        if (linkedRepository) {
          const githubFilePath = problemName + uploadFileName;

          // Check for existing user statistics to retrieve SHA if available
          const statistics = await new Promise((resolve) => {
            chrome.storage.local.get('userStatistics', (result) => {
              resolve(result.userStatistics);
            });
          });

          let sha = null;
          if (statistics && statistics.sha && statistics.sha[githubFilePath]) {
            sha = statistics.sha[githubFilePath];
          }

          // Upload the solution to the GitHub repository
          await uploadToGitHubRepository(
            accessToken,
            linkedRepository,
            solution,  // Send solution directly without encoding
            problemName,
            uploadFileName,
            sha,
            commitMessage,
            problemDifficulty
          );
        } else {
          console.error('No linked repository found.');
        }
      } else {
        console.error('Not in solve_and_push phase.');
      }
    } else {
      console.error('No GitHub access token found.');
    }
  } catch (error) {
    console.error("Error in uploadGitHub: ", error);
  }
}



const convertToKebabCase = (uploadFileName) => {
  return uploadFileName.replace(/[^a-zA-Z0-9\. ]/g, '').replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase();
};

function getSolutionLanguage() {
  // Query all anchor tags in the breadcrumb that might contain language info in the href
  const languageLink = document.querySelector('a[href^="/domains/"]');
  
  if (languageLink) {
    // Extract the href path (e.g., /domains/java)
    const href = languageLink.getAttribute('href');
    
    // Extract the language name from the href (after "/domains/")
    const lang = href.split('/domains/')[1].trim();
    
    // Check if the extracted language exists in your codeLanguage map
    if (lang && codeLanguage[lang]) {
      return codeLanguage[lang];  // Return the mapped language code
    }
  }
  
  return null;  // Return null if no language is found or it's unsupported
}

function getProblemTitle() {
  // Select all <li> elements that contain a <span itemprop="name">
  const problemTitleElement = document.querySelectorAll('li[itemprop="itemListElement"] span[itemprop="name"]');
  
  // Check if the 4th element exists (0-based index, so index 3 is the 4th element)
  if (problemTitleElement.length >= 4) {
    return problemTitleElement[3].innerText.trim();  // Return the title of the 4th item
  }
  
  return '';  // Return an empty string if the 4th element does not exist
}

function getProblemDifficulty() {
  
  return "Medium";
}

function getProblemStatement() {
  
  return "Print";
}

function getCompanyAndTopicTags(problemStatement) {
  let tagHeading = document.querySelectorAll('.problems_tag_container__kWANg');
  let tagContent = document.querySelectorAll(".content");

  for (let i = 0; i < tagHeading.length; i++) {
    if(tagHeading[i].innerText === 'Company Tags'){
      tagContent[i].classList.add("active");
      problemStatement = problemStatement.concat("<p><span style=font-size:18px><strong>Company Tags : </strong><br>");
      let numOfTags = tagContent[i].childNodes[0].children.length;
      for (let j = 0; j < numOfTags; j++) {
        if (tagContent[i].childNodes[0].children[j].innerText !== null) {
          const company = tagContent[i].childNodes[0].children[j].innerText;
          problemStatement = problemStatement.concat("<code>" + company + "</code>&nbsp;");  
        }
      }
      tagContent[i].classList.remove("active");
    }
    else if(tagHeading[i].innerText === 'Topic Tags'){
      tagContent[i].classList.add("active");
      problemStatement = problemStatement.concat("<br><p><span style=font-size:18px><strong>Topic Tags : </strong><br>");
      let numOfTags = tagContent[i].childNodes[0].children.length;
      for (let j = 0; j < numOfTags; j++) {
        if (tagContent[i].childNodes[0].children[j].innerText !== null) {
          const company = tagContent[i].childNodes[0].children[j].innerText;
          problemStatement = problemStatement.concat("<code>" + company + "</code>&nbsp;");  
        }
      }
      tagContent[i].classList.remove("active");
    }
    
  }
  return problemStatement;
}

const loader = setInterval(() => {
  let problemTitle = null;
  let problemStatement = null;
  let problemDifficulty = null;
  let solutionLanguage = null;
  let solution = null;

  if (window.location.href.includes('www.geeksforgeeks.org/problems',) || window.location.href.includes('practice.geeksforgeeks.org/problems',)) {

    const gfgSubmitButton = document.querySelector('[class^="ui button problems_submit_button"]');

    gfgSubmitButton.addEventListener('click', function () {
      document.querySelector('.problems_header_menu__items__BUrou').click();
      successfulSubmissionFlag = true;

      const submissionLoader = setInterval(() => {
        const submissionResult = document.querySelectorAll('[class^="problems_content"]')[0].innerText;
        if (submissionResult.includes('Problem Solved Successfully') && successfulSubmissionFlag) {
          successfulSubmissionFlag = false;
          clearInterval(loader);
          clearInterval(submissionLoader);
          document.querySelector('.problems_header_menu__items__BUrou').click();
          problemTitle = getProblemTitle().trim();
          problemDifficulty = getProblemDifficulty();
          problemStatement = getProblemStatement();
          solutionLanguage = getSolutionLanguage();
          console.log("Initialized Upload Variables");

          const probName = `${problemTitle}`;
          var questionUrl = window.location.href;
          problemStatement = `<h2><a href="${questionUrl}">${problemTitle}</a></h2><h3>Difficulty Level : ${problemDifficulty}</h3><hr>${problemStatement}`;
          problemStatement = getCompanyAndTopicTags(problemStatement);

          if (solutionLanguage !== null) {
            chrome.storage.local.get('userStatistics', (statistics) => {
              const { userStatistics } = statistics;
              const githubFilePath = probName + convertToKebabCase(problemTitle + solutionLanguage);
              let sha = null;
              if (
                userStatistics !== undefined &&
                userStatistics.sha !== undefined &&
                userStatistics.sha[githubFilePath] !== undefined
              ) {
                sha = userStatistics.sha[githubFilePath];
              }
              if (sha === null) {
                uploadGitHub(
                 problemStatement,
                  probName,
                  'README.md',
                  "Create README - GfG to GitHub",
                  problemDifficulty,
                );
              }

              chrome.runtime.sendMessage({ type: 'getUserSolution' }, function (res) {
                console.log("getUserSolution - Message Sent.");
                setTimeout(function () {
                  solution = document.getElementById('extractedUserSolution').innerText;
                  if (solution !== '') {
                    setTimeout(function () {
                      if (sha === null) {
                        uploadGitHub(
                          solution,
                          probName,
                          convertToKebabCase(problemTitle + solutionLanguage),
                          "Added Solution - GfG to GitHub",
                          problemDifficulty,
                        );
                      } else {
                        uploadGitHub(
                          solution,
                          probName,
                          convertToKebabCase(problemTitle + solutionLanguage),
                          "Updated Solution - GfG to GitHub",
                          problemDifficulty,
                        );
                      }
                    }, 1000);
                  }
                  chrome.runtime.sendMessage({ type: 'deleteNode' }, function () {
                    console.log("deleteNode - Message Sent.");
                  });
                }, 1000);
              });
            });
          }
        } 

        else if (submissionResult.includes('Compilation Error')) {
          clearInterval(submissionLoader);
        } 

        else if (!successfulSubmissionFlag && (submissionResult.includes('Compilation Error') || submissionResult.includes('Correct Answer'))) {
          clearInterval(submissionLoader);
        }
      }, 1000);
    });
  }

  // HackerRank logic integrated within the loader

  if (window.location.href.includes('www.hackerrank.com/challenges',)) {

    const hrSubmitButton=document.querySelector('.ui-btn.ui-btn-normal.ui-btn-primary.pull-right.hr-monaco-submit.ui-btn-styled');

    hrSubmitButton.addEventListener('click', function () {
      //document.querySelector('.problems_header_menu__items__BUrou').click();
      successfulSubmissionFlag = true;

      const submissionLoader = setInterval(() => {
        const submissionResult = document.querySelectorAll('.congrats-heading');
       
        const congratsMessage = submissionResult[0].innerText;

        if (congratsMessage.includes('Congratulations') && successfulSubmissionFlag) {
          successfulSubmissionFlag = false;
          clearInterval(loader);
          clearInterval(submissionLoader);
         // document.querySelector('.problems_header_menu__items__BUrou').click();
          problemTitle = getProblemTitle().trim();
          problemDifficulty = getProblemDifficulty();
          problemStatement = getProblemStatement();
          solutionLanguage = getSolutionLanguage();
          console.log("Initialized Upload Variables");

          const probName = `${problemTitle}`;
          var questionUrl = window.location.href;
          problemStatement = `<h2><a href="${questionUrl}">${problemTitle}</a></h2><h3>Difficulty Level : ${problemDifficulty}</h3><hr>${problemStatement}`;
          //problemStatement = getCompanyAndTopicTags(problemStatement);

          if (solutionLanguage !== null) {
            chrome.storage.local.get('userStatistics', (statistics) => {
              const { userStatistics } = statistics;
              const githubFilePath = probName + convertToKebabCase(problemTitle + solutionLanguage);
              let sha = null;
              if (
                userStatistics !== undefined &&
                userStatistics.sha !== undefined &&
                userStatistics.sha[githubFilePath] !== undefined
              ) {
                sha = userStatistics.sha[githubFilePath];
              }
              if (sha === null) {
                uploadGitHub(
                  btoa(unescape(encodeURIComponent(problemStatement))),
                  probName,
                  'README.md',
                  "Create README - GfG to GitHub",
                  problemDifficulty,
                );
              }

              chrome.runtime.sendMessage({ type: 'getUserSolution' }, function (res) {
                console.log("getUserSolution - Message Sent.");
                setTimeout(function () {
                  solution = document.getElementById('extractedUserSolution').innerText;
                  console.log(solution);
                  if (solution !== '') {
                    setTimeout(function () {
                      if (sha === null) {
                        uploadGitHub(
                          btoa(unescape(encodeURIComponent(solution))),
                          probName,
                          convertToKebabCase(problemTitle + solutionLanguage),
                          "Added Solution - GfG to GitHub",
                          problemDifficulty,
                        );
                      } else {
                        uploadGitHub(
                          btoa(unescape(encodeURIComponent(solution))),
                          probName,
                          convertToKebabCase(problemTitle + solutionLanguage),
                          "Updated Solution - GfG to GitHub",
                          problemDifficulty,
                        );
                      }
                    }, 1000);
                  }
                  chrome.runtime.sendMessage({ type: 'deleteNode' }, function () {
                    console.log("deleteNode - Message Sent.");
                  });
                }, 1000);
              });
            });
          }
        } 

        else if (congratsMessage.includes('Compilation Error')) {
          clearInterval(submissionLoader);
        } 

        else if (!successfulSubmissionFlag && (congratsMessage.includes('Compilation Error') || congratsMessage.includes('Correct Answer'))) {
          clearInterval(submissionLoader);
        }}
      , 1000);
    });
  }
  
}, 1000);
