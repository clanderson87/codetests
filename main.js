//set constants
const fontSize = 16;
const font = 'Arial'
const fontString = `${fontSize}px ${font}`

const output = document.getElementById('output');
const result = document.getElementById('resultDiv');
const context = output.getContext('2d');

const lightBox = '-'//'░';
const darkBox = 'X'//'█'; wanted to use these boxes, but they're not displaying monospace.

let inputObject = {}
if(window.innerWidth < 1240){
  window.alert("Please resize your browser window to at least 1240px wide. Thanks!")
}

trimText = () => {
  document.getElementById('subtitle').hidden = true;
  const text = document.getElementById('input').value;
  const numOfKeys = Math.ceil((text.length / 12));
  for (let i = 0; i < numOfKeys; i++) {
    let start = i * 12;
    let numToTake =  12;
    if(start + 12 > text.length){
      numToTake = text.length - start;
    }
    let newText = text.substr(start, numToTake);
    inputObject['key'+ i] = newText;
  };
  Object.values(inputObject).forEach(str => {
    convert(str.toUpperCase());
  });
}

convert = (text) => {
  let width = (text.length * (fontSize *.66));
  let height = fontSize * 1.1;
  output.width = width;
  output.height = height;
  context.font = fontString;
  context.fillText(text, 0, height - (fontSize/4));
  remapImageToAscii(width, height);
};

remapImageToAscii = (_width, _height) => {
  const info = context.getImageData(0, 0, _width, _height);
  const { data, height, width } = info;
  let returnObject = { height, width, rows: [] }
  for(let y = 0; y < height; y++){
    let row = '';
    for(let x = 0; x < width; x++){
      let i = (y * 4) * width + x * 4;
      (data[i] + data[i+1] + data[i+2] + data[i+3]) > 128 ? row += darkBox : row += lightBox;
    }
    returnObject.rows.push(row);
  }
  printToScreen(returnObject);
};

printToScreen = ({ height, width, rows }) => {
  rows.splice(rows.length-1, 1); /*trimming whitespace. Kind of want to do this more dynamically, 
    but this whitespace is actually set on the canvas, and my canvas positioning is both good enough and critical for MVP*/
  result.hidden = false;
  rows.forEach(row => {
    let newDiv = document.createElement('div');
    newDiv.class = "results";
    let newContent = document.createTextNode(row);
    newDiv.appendChild(newContent);
    result.append(newDiv);
  });
};