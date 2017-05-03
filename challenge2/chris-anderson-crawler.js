//CONST AND VARIABLE DECLARATIONS
const http = require('http');
const https = require('https');
const _URL = require('url');
const readline = require('readline');
const regexWebUrl = require('./regex-weburl');
const spawn = require('child_process').spawn;
const loadDom = require('cheerio').load;
const safeUrls = [
  'http://www.reddit.com','http://www.amazon.com','http://www.gizmodo.com',
  'http://www.cnn.com','http://www.lifehacker.com','http://www.wikipedia.com',
  'http://www.ebay.com','http://www.yahoo.com','http://www.foodnetwork.com',
  'http://www.w3schools.com','http://www.pinterest.com','http://www.expedia.com',
  'http://www.espn.com','http://www.fivethirtyeight.com','http://www.arstechnica.com',
  'http://www.techcrunch.com','http://www.seriouseats.com','http://www.msn.com',
  'http://www.wookiepedia.com', 'http://www.quora.com', 'http://www.marksdailyapple.com',
  'http://www.washingtonpost.com','http://www.yelp.com', 'http://www.aol.com',
  'http://www.time.com', 'http://www.about.com', 'http://www.usatoday.com',
  'http://www.dailymail.co.uk', 'http://www.latimes.com', 'http://www.wsj.com',
  'http://www.youtube.com', 'http://www.wired.com', 'http://www.gaurdian.co.uk',
  'http://www.kickstarter.com', 'http://www.groupon.com', 'http://www.instructables.com',
  'http://www.soundcloud.com', 'http://www.medium.com', 'http://www.buzzfeed.com',
  'http://www.imdb.com', 'http://www.sourceforge.net', 'http://www.etsy.com',
  'http://www.dailymotion.com', 'http://www.cnet.com',  'http://www.tripadvisor.com',
  'http://www.goodreads.com', 'http://www.wunderground.com', 'http://www.meetup.com'
];

//Main URL lets
let STATUS = 0;
let HEADERS = {};
let HOSTNAME = '';
let PROTOCOL = '';

let visitedUrls = [];
let repo = [];
let alternativeUrls = [];
let currentUrl = '', $;
let keepGoing = true;
let printMoreMessages = true;
let repoCapacity = 50;

//repoEntry Constructor
const repoEntry = function(hostname, collectedLinks){
  this.hostname = hostname;
  this.collectedLinks = collectedLinks;
};

const setMainLets = (mainLets) => {
  const { statusCode, headers, hostname, protocol } = mainLets;
  STATUS = statusCode;
  HEADERS = headers;
  HOSTNAME = hostname;
  PROTOCOL = protocol;
};

//CONSOLE MESSAGES
const messages = {
  initialPrompt() {
    checkBeforePrinting('\nPlease enter a URL: ');
  },
  goodInitialUrl(url){
    checkBeforePrinting(`\nIt's an old url, but it checks out. Crawling on ${url}`);
  },
  resourceAquired(text){
    return checkBeforePrinting( '\nResource \'' + text + '\' aquired.');
  },
  error(err){
    return checkBeforePrinting(`Error: ${err}.
      @ ${err.stack}
      Resetting URL back to safety....
      \'p\' to abort.`
    );
  },
  openingUrlsInBrowser(){
    return checkBeforePrinting('\nOpening a selection of previously crawled URLs in the browser.\n');
  },
  needMoreLinks(len){
    return checkBeforePrinting(`\nNeed more links.\nYou've crawled ${len} links so far, but you need to have crawled 5 to 'open'.\nReally, I've crawled them, but I'll share so you don't rm -rf me.`);
  },
  promptWithInfo(){
    return checkBeforePrinting('\n\'s\' to pause and see current output.\n\'p\' to take a minute and enjoy the sweet, sweet links.\n\'o\' to open a couple crawled links in your browser (macOS)\n\'x\' to put me out of my misery.');
  },
  pausing(){
    return checkBeforePrinting(`\nTaking a breather.\nTell me to \'r\' whenever you want me to get back to work on ${currentUrl}`)
  },
  tryUrlAgain(url){
    return checkBeforePrinting(`\nThat URL, ${url}, is borked.\nPlease unbork and re-enter, or try again with a different URL\nOr type 'h' to get other options.`)
  },
  runningFoundResults(obj){
    return checkBeforePrinting(`\nFound ${obj.collectedLinks.length} remote URLs on ${obj.hostname}.\n${obj.collectedLinks.length > 0 ? 'Pushed to Repo' : 'Didn\'t push empty array' }.\nRepo size: ${repo.length}, ${(repo.length/repoCapacity)*100}% full.`);
  },
  increaseRepoCapacityAndContinue(){
    return checkBeforePrinting(`\n\tJeez, I'm stuffed.\n\tRepo size: ${repo.length}.\n\tAllowed Repo size: ${repoCapacity}.\n\tLet me know what to do next:\n\t\'s\' to pause see results.\n\t\'r\' to increase repo size and keep going.\n\t'o' to open some of these links\n\t'x' to quit.`);
  },
  resume(){
    return checkBeforePrinting(`Re-entering crawl with ${currentUrl}`);
  },
  exit(){
    const byeMessages = ['I thought you would never leave...', 'Finally!', 'bye, felicia', 'I\'ll always remember what we had here until my processes are destroyed by the garbage collector', 'Howabout I go this time? And you stay locked in the terminal? For kicks and giggles?', 'See you when I see you.'];
    let index = Math.floor(Math.random() * byeMessages.length)
    return checkBeforePrinting(byeMessages[index]);
  },
  makeConsoleHeaders(text){
    const spacer = '++++++++++++++++++++';
    return checkBeforePrinting(`\n${spacer} ${text.toUpperCase()} ${spacer}\n`);
  },
  consoleLogEverything(){
    return console.log(`STATUS: ${STATUS}\nHOSTNAME: ${HOSTNAME}\nHEADERS: ${HEADERS}\nPROTOCOL: ${PROTOCOL}\nvisitedUrls: ${visitedUrls}\nrepo: ${repo}\nrepo.length: ${repo.length}\nrepoCapacity: ${repoCapacity}\nalternatveUrls: ${alternativeUrls}\nalternativeUrls.length: ${alternativeUrls.length}\ncurrentUrl: ${currentUrl}\n$: ${$}\nkeepGoing: ${keepGoing}\nprintMoreMessages: ${printMoreMessages}`);
  },
  earlyExit(){ return console.log('FORCE CLOSING IS MURDER.')},
  endOfInternet(){ return console.log(`\nWell, you've done it. \nYou've reached the end of the internet.\nJust dust and echos now.`)}
};

//SAFTEY METHODs
const resetUrlToRepo = () => {
  if(keepGoing === true){
    const { length } = repo;
    if (length > 0){
      const { collectedLinks } = repo[length - 1];
      if(collectedLinks.length > 0){
        getUrl(collectedLinks[0]);
      } else {
        repo.pop();
        resetUrlToRepo();
      }
    } else {
      resetUrlToSaftey();
    }
  }
};

const resetUrlToSaftey = () => {
  safeUrls.length > 0 ?
  getUrl(safeUrls.shift()) :
  messages.endOfInternet();
};

const limitAlternativeUrls = link => {
  const { length } = alternativeUrls;
  if(length > 499){
    alternativeUrls.shift();
  }
  alternativeUrls.push(link);
};

//DATA METHODS
const collectLinks = dom => {
  let arr = [];
  let repo_entry = new repoEntry(HOSTNAME, arr);
  try {
    let links = dom("a[href^='http']").toArray();

    const { collectedLinks } = repo_entry;
    links.forEach(link => {
      let url = link.attribs.href;
      if(!url.includes(HOSTNAME)){
        if(!collectedLinks.includes(url)){
          collectedLinks.push(url);
        };
      };
    });
  
    selectNewLink(repo_entry);
  } catch (err){
    messages.error(err);
    setTimeout(resetUrlToRepo, 3250);
  }
};

const addToRepo = obj => {
  if(repo.length < repoCapacity){
    let hostnames = [];
    repo.forEach(entry => {
      hostnames.push(entry.hostname)
    });

    if(!hostnames.includes(obj.hostname)){
      if(obj.collectedLinks.length > 0){
        repo.push(obj);
        currentUrl = repo[repo.length - 1].next;
      }
      messages.runningFoundResults(obj);
    }
  };
};

const selectNewLink = obj => {
  const { collectedLinks } = obj; 
  const { length } = collectedLinks;
  
  if(!length > 0){
    getUrl(alternativeUrls[0]);
  } else {
    let newLink = collectedLinks.shift();
    collectedLinks.forEach(link => limitAlternativeUrls(link));
    obj.next = newLink;
    verifyUndiscovered(obj);
    addToRepo(obj);
  };
};

const verifyUndiscovered = obj => {
  const { next } = obj;
  const { hostname } = _URL.parse(next, true, true);
  if(!visitedUrls.includes(hostname)){
    getUrl(next);
  } else {
    obj.next = null;
    selectNewLink(obj);
  }
}

//NETWORK METHODS
const createJSDOM = content => {
  $ = loadDom(content);
  messages.resourceAquired($('title').text());
  collectLinks($);
};

const createDataString = res => {
  try {
  let content = '';
  res.on('data', data => {
    content += data
  });
  res.on('end', () => {
    createJSDOM(content);
  })
  } catch (err){
    messages.error(err);
    setTimeout(resetUrlToRepo, 3250);
  }
};

const handleStatusCode = (res, parsedUrl) => {
  const { statusCode, headers } = res;
  const { hostname, protocol } = parsedUrl;
  const mainLets = { statusCode, headers, hostname, protocol };
  setMainLets(mainLets);
  if(statusCode > 199 && statusCode < 299){
    createDataString(res);
  } else if(statusCode > 299 && statusCode < 399){
    getUrl(headers.location);
  } else if (statusCode > 399 && statusCode < 499){
    let newUrl = alternativeUrls[0]
    getUrl(newUrl);
  } else if (statusCode > 499){
    setTimeout(resetUrlToRepo, 3250)
  }
}

const getUrl = url => {
  if(keepGoing = false){
    return;
  }
  else if(repo.length >= repoCapacity){
    keepGoing = false;
    messages.increaseRepoCapacityAndContinue();
    printMoreMessages = false;
    return;
  }
  else if(keepGoing = true){
    try {
      const parsedUrl = _URL.parse(url, true, true);
      const { hostname, protocol } = parsedUrl;
      const _protocol = protocol === 'https:' ? https : http;
      if(!visitedUrls.includes(hostname)){
        _protocol.get(url, res => {
          visitedUrls.push(hostname);
          handleStatusCode(res, parsedUrl)
        })
        .on('error', err =>
          messages.error(err),
          setTimeout(resetUrlToRepo, 3250)
        );
      } else {
        let index = Math.floor(Math.random() * repo.length)
        selectNewLink(repo[index]);
      }
    } catch(err){
      messages.error(err);
      setTimeout(resetUrlToRepo, 3250);
    }
  }
};

//CONSOLE / UI METHODS
const checkBeforePrinting = (arg) =>{
  if(printMoreMessages === true){ 
    return console.log(arg);
  } 
};

const openURLS = () => {
  const { length } = visitedUrls;
  if(length > 5){
    let x = 0
    visitedUrls.forEach((visited, i) => {
      if(x < 6 && length % i === 0){
        spawn('open', ['http://' + visited]);
        x++;
      }
    });
  } else {
    messages.needMoreLinks(length)
  };
}
const rl = readline.createInterface({
  prompt: messages.initialPrompt(),
  input: process.stdin,
  output: process.stdout,
});

rl.prompt(); //Enter program
 
rl.on('line', (input) => {
  input = input.toLowerCase().trim()
  const { 
    goodInitialUrl, 
    promptWithInfo, 
    makeConsoleHeaders,
    pausing,
    resume,
    openingUrlsInBrowser,
    exit,
    tryUrlAgain
  } = messages;

  const startCrawl = url => {
    currentUrl = url;
    getUrl(url);
    goodInitialUrl(url);
    promptWithInfo();
  };
  
  const showResults = () => {
    let totalLinks = 0;
    makeConsoleHeaders('results');
    visitedUrls.forEach(visited => console.log(`\t ${visited}`));
    makeConsoleHeaders('links collected');
    repo.forEach((obj) => {
      makeConsoleHeaders(`${obj.hostname}`)
      let { length } = obj.collectedLinks;
      makeConsoleHeaders(`${length} links found.`);
      totalLinks += length;
      obj.collectedLinks.forEach(link => console.log(`\t${link}`));
    })
    makeConsoleHeaders('total number of links collected');
    console.log(`\n\t\t${totalLinks}\n`);
  }
  
  switch(input){
    case 'h':
      printMoreMessages = true;
      promptWithInfo();
      printMoreMessages = false;
      break;
    case 's':
      printMoreMessages = true;
      keepGoing = false;
      showResults();
      promptWithInfo();
      printMoreMessages = false;
      break;
    case 'p':
      keepGoing = false;
      pausing();
      printMoreMessages = false;
      break;
    case 'r':
      if(repo.length >= repoCapacity){
        repoCapacity += 50;
      };
      printMoreMessages = true;
      if(keepGoing = false){
        keepGoing = true;
        resume();
        resetUrlToRepo();
      };
      break;
    case 'x':
      printMoreMessages = true;
      exit();
      process.exit(0);
    case 'o':
      printMoreMessages = true;
      openingUrlsInBrowser();
      openURLS();
      printMoreMessages = false;
      break;
    case '?':
      messages.consoleLogEverything();
      printMoreMessages = false;
      break;
    default:
      if(!input.startsWith('http')){
        input = `http://${input}`;
      };
      printMoreMessages = true;
      regexWebUrl.test(input) === true ?
      startCrawl(input) :
      tryUrlAgain(input);
      break;
  };
}).on('close', () => {
  messages.earlyExit();
  rl.close();
  process.exit(0);
});