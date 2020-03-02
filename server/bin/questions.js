exports.get = (distributions) => {
    const questions = [
        {
          type : 'list',
          name : 'distribution',
          message : 'Select your Linux distribution: ',
          choices: distributions,
        },
        {
          type : 'input',
          name : 'package',
          message : 'Enter your Linux package: ',
          validate: value => {
            const pass = (value !== '');
            if (pass) { return true; }
            return 'Error: You must enter a Linux package';
          },
        },
        {
          type : 'number',
          name : 'quantity',
          message : 'Enter the number of results to display: ',
          default: () => 10,
          validate: value => {
            const pass = (value > 0);
            if (pass) { return true; }
            return 'Error: value must be greater than 0.';
          },
        }
    ];
    return questions;
}
