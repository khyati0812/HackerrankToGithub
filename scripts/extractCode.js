// Your custom code extraction logic
const extractCode = () => {
  // Select all the 'view-line' divs containing the code
  const codeLines = document.querySelectorAll('.view-line');

  // Initialize an empty string to hold the extracted code
  let extractedCode = '';

  // Check if code lines are found
  if (codeLines.length === 0) {
      console.log('No code lines found.');
      return;
  }

  // Iterate through each line and append its text to the extractedCode variable
  codeLines.forEach(line => {
      const text = line.innerText; // Get the inner text of the line
      extractedCode += text + '\n'; // Append the text with a new line
  });

  // Create a new pre element to display the extracted code
  const scriptInjectedElement = document.createElement('pre');
  scriptInjectedElement.innerText = extractedCode; // Set the inner text to the extracted code
  scriptInjectedElement.setAttribute('id', 'extractedUserSolution');
  scriptInjectedElement.setAttribute('style', 'color: #fff; white-space: pre-wrap;'); // Ensure white space is preserved

  // Append the new pre element to the body or desired parent element
  document.body.appendChild(scriptInjectedElement);
  
  // Log the extracted code to the console for verification
  console.log('Extracted Code:\n', extractedCode);
};

// Create a script to inject the extractCode function and immediately invoke it
const getCodeScript = `
(${extractCode.toString()})(); // Convert the function to string and invoke it
`;

// Create a script element
var extractCodeScript = document.createElement('script');
extractCodeScript.id = 'extractCodeScript';
extractCodeScript.appendChild(document.createTextNode(getCodeScript));

// Append the script to the body or head
(document.body || document.head || document.documentElement).appendChild(extractCodeScript);
