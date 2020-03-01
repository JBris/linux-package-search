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
          message : 'Enter your Linux package: '
        },
    ];
    return questions;
}
