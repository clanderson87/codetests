#Challenge2

##CANDIDATE:

Chris Anderson

cl.anderson8@gmail.com

Nashville TN


##APP SPEC:

Challenge 2: Web Crawler (Optional)
  Write a web crawler that ranks Web URLs with the number of remote URLs that reference.

###USE CASE
  1. User enters in a URL
  2. Application connects to the URL (visually rendering webpage is not required, but a bonus.)
  3. Application collects all the remote URLs (i.e. URLs on a different domain) from the HTML.
  4. Application outputs to the user:
            “Found x remote URLs on Domain.com”
  5. Application then navigates to one of the remote URLs and repeats step #2.

###ADDITIONAL REQUIREMENTS
  1. At any time, user should be able to click “Show Results” which will pause the crawler and
        display in descending order, the URLs and the number of remote URLs they contain.
  2. The user should then be able to resume the crawler from where it was paused.
  3. The crawler should not re-visit a URL it’s already visited.

###TECH REQUIREMENTS
  1. Can be written in C, C#, C++, Java, JavaScript or other common languages
  2. Handle all edge-cases and exceptions

###UI REQUIREMENTS
  1. One TextBox (Input)
  2. One Button: “Start / Pause / Resume”
  3. One DataGrid/Table (Output)


##USAGE:

This was developed and tested using Node 7.7.0. It should work with as low as 7.5.0.
Current `node -v` as of this writing is [7.9.0](https://nodejs.org/en/), so if you install the latest version of Node you should be good.

cd challenge2
npm install
node chris-anderson-crawler.js

Enter a URL to begin. Ex: 

'digg.com'

Then, you can:

'p' to pause.
's' pause and show results.
'r' to resume after pausing.
'o' to open some of these links in the browser (this has been tested on macOS, but this doesn't work in all versions of windows, so be advised)
'?' to see debugging variables
'x' to exit.

##RETROSPECTIVE:

Google is hard work.

I did this in [node.js](https://nodejs.org/dist/latest-v7.x/docs/api/), using only one external library that's not pre-packaged with node 7.7.0. That library is [cheerio](https://github.com/cheeriojs/cheerio), a sort of server side jQuery that allowed me
to parse the incloming link bodies.

I did also use a pre-made regex to validate user input URLs, which is included in the directory.

This isn't perfect. It seems to handle errors well and keeps crawling, but it needs some work. I'm still getting some dupe visits for reasons I can't quite figure out, and I still get the occasional Max call stack exceeded, but it's thrown by the Cheerio library on particularly massive and/or deep DOMs. From what I've seen, max call stack exceptions don't catch well. I've never built a crawler and this taught me a good bit about the basics of the internet, as well as more practice with Javascript data manipulation.

Speaking of, I chose javascript because of technical resons I explained below, but I definately could see how a strongly-typed, Object-oriented language would be beneficial here. I may look into typescript for node

I think I still have the crawler revisiting some old sites from time to time. I have a suspiscion that this is both due to 300-type HTTP response codes and also my way of handling errors and making sure the program doesn't hang.

I made some design choices that beyond the project requirements for better usability, at least when it comes to debugging. The program auto-pauses when the results repository array grows to 50 entries (not 50 links, 50 unique hostnames). Users can resume and increment this by 50. Before I put this in, the repo would get... sizeable, depending on the sites visited. I didn't like sutting down the console each and everytime my project got stuck on some international version of Buzzfeed.

##PRE-CODE:

Design thoughts:

Ideally, I'd use a strongly typed language like C#, but every time I boot my Virtual Machine my Mac cries like Kevin James running a Marathon. Then it dies - much like Kevin James running a Marathon.

I've researched how to do this in python, but I'm not experienced enough with it to code this with any confidence. In time, perhaps. I've also looked into elixir, because I love it. However, documentation is not as mature due to elixir's young age, and I would need to load more libraries than I'd like. Besides, the app spec says 'common' language. I don't know if Elixir counts as common yet.

And I like es2016/2017. I said it. I LIKE ES2016/2017. It's not perfect, but it's trying to get better. I respect that. I can identify with that. So Javascript it is.

I think this will be a Node.js console application. I may have use for the browser for UI elements, but this can't be executed in the browser and I don't see a need for using it for one button. Besides, the world needs more command line scripts. Therefore, all buttons will be text inputs from the CLI, and those must be well prompted.

1. User enters in a URL
    * Validate URL using an appropriate open source RegEx.
    * return true to continue to step 2, false displays message to user.
2. Application connects to the URL (visually rendering webpage is not required, but a bonus.)
    * If url valid, get url
    * handle status sent back by server.
    * save url to `currentUrl` variable.
    * find way for console to open website in browser (This kind of feels like a cop out, but MVP);
3. Application collects all the remote URLs (i.e. URLs on a different domain) from the HTML.
    * using something to similar to `document.querySelectorAll('a')`, gather all remote URLs
    * forEach url, check if the `collectedUrl.host` is different from currentUrl.host
      1. if true, push into a to foundURLs array, false - ignore.
4. Application outputs to the user:
                  “Found x remote URLs on Domain.com”
  foundUrls.length and currentUrl.
5. Application then navigates to one of the remote URLs and repeats step #2.
  * package `{ domain: currentUrl, foundUrls: foundUrls }`, `push` into `results[]`;
  * pick a random index within `foundUrls` and set it to `newUrl`;
  * collect all other not-chosen links as `alternativeUrls` to try incase newUrl borks.
  * `visitedUrls.push(currentUrl)`
  * if `visitedUrls.includes(newUrl.host) === true`, re-pick random index within alternativeUrls.
    1. if that fails, repick from collected results in repo as newUrl until `false`
  
  * UI will be done via CLI and prompted commands.

##Thanks for looking through this. Any comments are welcome. Have a great day!