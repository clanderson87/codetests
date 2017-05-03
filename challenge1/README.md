# Challenge 1

## CANDIDATE:

Chris Anderson  
cl.anderson8@gmail.com  
Nashville TN  


## APP SPEC:
  
  Challenge 1: Text to Banner
  Given an alphanumeric input of 0-100 characters, produce an output similar to that of an LED display.
  ex. “Hello” would produce:

         ░░░░░░░░░░░░░░░░░░░░░
         ░█░█░███░█░░░█░░░███░
         ░█░█░█░░░█░░░█░░░█░█░
         ░███░██░░█░░░█░░░█░█░
         ░█░█░█░░░█░░░█░░░█░█░
         ░█░█░███░███░███░███░
         ░░░░░░░░░░░░░░░░░░░░░

  TECH REQUIREMENTS
  * Can be written in C, C#, C++, Java, JavaScript or other common languages
  * Handle all edge-cases and exceptions

  UI REQUIREMENTS
  * One TextBox (Input)
  * One Button
  * One TextBox (Output)

## Design Thoughts:

So after trying to do this in c# .NET core in the Mac environment, I've converted to javascript. I wanted to
write this in C#/ .NET because I think the console envrionment is perfect for this. After research, my action plan was

* Prompt user for text input
* Console.ReadLine() the input as string
* Convert string to a Bitmap image
* Using a StringBuilder, I'd Loop over each pixel and .Append() an ░ or █ depending if the pixel was dark or not
* Console.WriteLine() those created strings.

Now I think there may be some flaws in that plan, but I really didn't get to test it out. 
.NET core for Mac doesn't make use of the System.Drawing namespace due to some concerns about cross-platform performance,
and the best alternative out right now is called ImageSharp, which has some build error issues as well.

So I went to Javascript.

The process is essentially the same, though I'm now using HTML and CSS to assist the Javascript.
I'm making heavy use of the HTML5 canvas element even though it doen't have any screen time (it's .hidden = true), it's the real magic here.
I'm converting the input string to an image using the canvas, then looping over every pixel in that image and using it's RGBA values
to determine if it is opaque (X) or not (-). I create a string for every row, push every row into an array, then use array.forEach
and document.createElement to output each string. If the font is monofaced, an LED-like output is achieved.

I'm making heavy use of ES2016 features like arrow functions, object destructuring and template strings because... they're awesome. 
They make javascript friendly and pretty. That said, I know they don't have widespread adoption outside of Chrome and Firefox, so I
included the babel-polyfill library to make them a little friendlier to everyone.

To use, cd into the directory and serve with the http server of your choice. If the window size is too small, you will be prompted to 
resize your window. Enter some text into the input field, hit convert, and be amazed enough to hire me?

Thanks for taking time to look at this. If you have any questions, please let me know. My contact info is enclosed with this. Have a great one!