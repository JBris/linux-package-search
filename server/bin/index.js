#!/usr/bin/env node

const dotenv = require('dotenv').config(process.cwd(), ".env");
if(dotenv.error){
    console.error(dotenv.error);
    process.exit(1);
}

const program = require('commander');
const { prompt } = require('inquirer');
const linux = require("./linux");
const config = require("../src/config/config").get();
const providers = config.LINUX_SEARCH_PROVIDERS;
const distributions = Object.keys(providers);
const questions = require("./questions").get(distributions);

program
.version('1.0.0')
.description('Linux Package Search application')

program
.command("search")
.alias('s')
.description('Search for a list of packages by name.')
.action(() => prompt(questions)
    .then(answers => linux.search( answers.distribution, answers.package, answers.quantity, config ))
);

program
.command("view")
.alias('v')
.description('View details for the specified package.')
.action(() => prompt(questions)
    .then(answers => linux.view( answers.distribution, answers.package, answers.quantity, config ))
);

program
.command("arsearch")
.alias('as')
.description('Search for a list of archived packages by name.')
.action(() => prompt(questions)
    .then(answers => linux.archiveSearch( answers.distribution, answers.package, answers.quantity, config ))
);

program
.command("arview")
.alias('av')
.description('View archived details for the specified package.')
.action(() => prompt(questions)
    .then(answers => linux.archiveView( answers.distribution, answers.package, answers.quantity, config ))
);

program
.command("arsave")
.alias('asv')
.description('Save the specified package to the archive.')
.action(() => prompt(questions)
    .then(answers => linux.archiveSave( answers.distribution, answers.package, answers.quantity, config ))
);

program
.command("ardel")
.alias('ad')
.description('Delete the specified package from the archive.')
.action(() => {
    let deleteQuestions = [ ...questions ];
    deleteQuestions.splice(2, 1);
    prompt(deleteQuestions)
    .then(answers => linux.archiveDelete( answers.distribution, answers.package, config )) 
});

program
.command("isearch [query...]")
.alias('is')
.description('Perform a full-text search of indexed content. Use the format (key=value key=value...)')
.action(query => {
    quantityQuestion = questions[2];
    prompt(quantityQuestion)
    .then(answers => linux.indexSearch( query, config, answers.quantity )
    .then(() => process.exit(0)))
});

program
.command("index")
.alias('i')
.description('Index the specified package for the search engine.')
.action(() => prompt(questions)
    .then(answers => linux.indexSave( answers.distribution, answers.package, answers.quantity, config ))
);

program
.command("idel")
.alias('id')
.description('Delete the specified package from the index.')
.action(() => {
    let deleteQuestions = [ ...questions ];
    deleteQuestions.splice(2, 1);
    prompt(deleteQuestions)
    .then(answers => linux.indexDelete( answers.distribution, answers.package, config )) 
});

program.on('command:*', () => {
    console.info('Invalid command: %s', program.args.join(' '));
    program.outputHelp();
    process.exit(0);
});

if (!process.argv.slice(2).length) {
    program.outputHelp();
    process.exit(0);
}

program.parse(process.argv);
