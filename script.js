const infixToFunction = {
  "+": (x, y) => x + y,
  "-": (x, y) => x - y,
  "*": (x, y) => x * y,
  "/": (x, y) => x / y,
};
//This function maps arithmetic operators to their corresponding functions.

const infixEval = (str, regex) =>
  str.replace(regex, (_match, arg1, operator, arg2) =>
    infixToFunction[operator](parseFloat(arg1), parseFloat(arg2))
  );
/*In this function the  str is taken as parameter and separates the argument according to the regex given.
Then the following arithmetic operation is done as required with thw help of "infixToFunction."*/

const highPrecedence = (str) => {
  const regex = /([\d.]+)([*\/])([\d.]+)/; // [\d.] is similar to [0-9].
  const str2 = infixEval(str, regex);
  return str === str2 ? str : highPrecedence(str2);
};
/*This function checks whether it consists of high precedence operator like multiplication or division.
This functions keeps on recursing until there are no more high precedence operators left.
for example take 4*3*2 
At first the string is sent to infixEval with the regex where the replace function is used to separate the required arguments. After the replace fn only the 4*3 part is taken into the arrow function of replace. The arithmetic operation is now done. Now the modified string is returned as 12*3. Now the funtion goes into recursion and gives the next o/p as 36 in the high precedence function. Here the str2==str matches so str is returned as there are no high precedence left to be done.*/

const isEven = (num) => num % 2 === 0; //returns true if the number is even.
const sum = (nums) => nums.reduce((acc, el) => acc + el, 0); //returns the sum of the array of numbers.
const average = (nums) => sum(nums) / nums.length; // returns average of an array of numbers.

const median = (nums) => {
  const sorted = nums.slice().sort((a, b) => a - b);
  //here slice is used inorder not to change the original string.
  const length = sorted.length;
  const middle = length / 2 - 1;
  return isEven(length)
    ? average([sorted[middle], sorted[middle + 1]]) //this is for array with even no. of elements.
    : sorted[Math.ceil(middle)]; //  this is for odd number of length.
};

const spreadsheetFunctions = {
  sum,
  average,
  median,
  even: (nums) => nums.filter(isEven),
  someeven: (nums) => nums.some(isEven), //some() fn checks whether at least one element passes the given test.
  everyeven: (nums) => nums.every(isEven), //even() fn checks whether all element passes the given test.
  firsttwo: (nums) => nums.slice(0, 2), //returns only the first two elements.
  lasttwo: (nums) => nums.slice(-2), //returns the last two elements.
  has2: (nums) => nums.includes(2),
  increment: (nums) => nums.map((num) => num + 1),
  random: ([x, y]) => Math.floor(Math.random() * y + x), //returns a number b/w the range of x and y.
  range: (nums) => range(...nums), //returns the range of the numbers.
  nodupes: (nums) => [...new Set(nums).values()], //returns the array without any duplicate element.
  "": (nums) => nums, //returns the same number if there are no functions.
};

const applyFunction = (str) => {
  const noHigh = highPrecedence(str);
  const infix = /([\d.]+)([+-])([\d.]+)/;
  /* used for evaluating addition,subtraction process.*/
  const str2 = infixEval(noHigh, infix);
  const functionCall = /([a-z0-9]*)\(([0-9., ]*)\)(?!.*\()/i;
  const toNumberList = (args) => args.split(",").map(parseFloat); //converts the element from string to float.
  const apply = (fn, args) =>
    spreadsheetFunctions[fn.toLowerCase()](toNumberList(args));
  return str2.replace(functionCall, (match, fn, args) =>
    spreadsheetFunctions.hasOwnProperty(fn.toLowerCase()) //checks whether the written fn is present in spreadSheetFunction.
      ? apply(fn, args)
      : match
  );
};
//The hasOwnProperty() method of Object instances returns a boolean indicating whether this object has the specified property as its own property (as opposed to inheriting it).

const range = (start, end) =>
  Array(end - start + 1) // Creates an array with length equal to (end - start + 1).
    .fill(start) // Fills the array with the value of `start`.
    .map((element, index) => element + index); // Maps each element to start + index.

const charRange = (start, end) =>
  range(start.charCodeAt(0), end.charCodeAt(0)).map((code) =>
    String.fromCharCode(code)
  );
//Similar to range but gives characters(ex:['a','b','c']).

const evalFormula = (x, cells) => {
  const idToText = (id) => cells.find((cell) => cell.id === id).value; //finds the cell of the given id.
  const rangeRegex = /([A-J])([1-9][0-9]?):([A-J])([1-9][0-9]?)/gi;
  const rangeFromString = (num1, num2) => range(parseInt(num1), parseInt(num2));
  const elemValue = (num) => (character) => idToText(character + num);
  const addCharacters = (character1) => (character2) => (num) =>
    charRange(character1, character2).map(elemValue(num));
  const rangeExpanded = x.replace(
    rangeRegex,
    (_match, char1, num1, char2, num2) =>
      rangeFromString(num1, num2).map(addCharacters(char1)(char2))
  );
  const cellRegex = /[A-J][1-9][0-9]?/gi;
  const cellExpanded = rangeExpanded.replace(cellRegex, (match) =>
    idToText(match.toUpperCase())
  );
  const functionExpanded = applyFunction(cellExpanded);
  return functionExpanded === x
    ? functionExpanded
    : evalFormula(functionExpanded, cells);
};

window.onload = () => {
  const container = document.getElementById("container");
  const createLabel = (name) => {
    const label = document.createElement("div");
    label.className = "label";
    label.textContent = name;
    container.appendChild(label);
  };
  const letters = charRange("A", "J");
  letters.forEach(createLabel);
  range(1, 99).forEach((number) => {
    createLabel(number); //created for reference number on the left side.
    letters.forEach((letter) => {
      //used to create each box.
      const input = document.createElement("input");
      input.type = "text";
      input.id = letter + number;
      input.ariaLabel = letter + number;
      input.onchange = update;
      container.appendChild(input);
    });
  });
};

const update = (event) => {
  const element = event.target;
  const value = element.value.replace(/\s/g, "");
  if (!value.includes(element.id) && value.startsWith("=")) {
    element.value = evalFormula(
      value.slice(1),
      Array.from(document.getElementById("container").children)
    );
  }
};
/*
Key learnings
1)  The global window object represents the browser window (or tab). It has an onload property which allows you to define behavior when the window has loaded the entire page, including stylesheets and scripts.
2)The fill() method of Array instances changes all elements within a range of indices in an array to a static value. It returns the modified array. 
		fill(value)
		fill(value, start)
		fill(value, start, end)
3)The charCodeAt() method of String values returns an integer between 0 and 65535 representing the UTF-16 code unit at the given index.charCodeAt() always indexes the string as a sequence of UTF-16 code units, so it may return lone surrogates. To get the full Unicode code point at the given index, use String.prototype.codePointAt().

4)The String.fromCharCode() static method returns a string created from the specified sequence of UTF-16 code units.
	console.log(String.fromCharCode(65));
	// Expected output: "A"
5)The setAttribute() method of the Element interface sets the value of an attribute on the specified element. If the attribute already exists, the value is updated; otherwise a new attribute is added with the specified name and value.

To get the current value of an attribute, use getAttribute(); to remove an attribute, call removeAttribute().

If you need to work with the Attr node (such as cloning from another element) before adding it, you can use the setAttributeNode() method instead.

6)The reduce() method of Array instances executes a user-supplied "reducer" callback function on each element of the array, in order, passing in the return value from the calculation on the preceding element. The final result of running the reducer across all elements of the array is a single value.

The first time that the callback is run there is no "return value of the previous calculation". If supplied, an initial value may be used in its place. Otherwise the array element at index 0 is used as the initial value and iteration starts from the next element (index 1 instead of index 0).

7)slice()-->  The slice() method of Array instances returns a shallow copy of a portion of an array into a new array object selected from start to end (end not included) where start and end represent the index of items in that array. The original array will not be modified.
	syntax:
	slice()
	slice(start)
	slice(start, end)
8)The sort() method of Array instances sorts the elements of an array in place and returns the reference to the same array, now sorted. The default sort order is ascending, built upon converting the elements into strings, then comparing their sequences of UTF-16 code units values.

The time and space complexity of the sort cannot be guaranteed as it depends on the implementation.

	syntax:
	sort()
	sort(compareFn)
9)The onchange event occurs when the value of an HTML element is changed.

10)The target property returns the element where the event occured.

The target property is read-only.

The target property returns the element on which the event occurred, opposed to the currentTarget property, which returns the element whose event listener triggered the event.

11)The includes() method of Array instances determines whether an array includes a certain value among its entries, returning true or false as appropriate.
ex:const array1 = [1, 2, 3];

console.log(array1.includes(2));
// Expected output: true

Synatx:
includes(searchElement)
includes(searchElement, fromIndex)

12)The startsWith() method of String values determines whether this string begins with the characters of a specified string, returning true or false as appropriate.

13)The concept of returning a function within a function is called currying. This approach allows you to create a variable that holds a function to be called later, but with a reference to the parameters of the outer function call.

Without Currying:
// Regular function to calculate volume
function calculateVolume(length, width, height) {
    return length * width * height;
}

// Using the function
const volume = calculateVolume(2, 3, 4);
console.log(volume); // Output: 24

With Currying:
// Curried function to calculate volume
function calculateVolumeCurried(length) {
    return function(width) {
        return function(height) {
            return length * width * height;
        }
    }
}

// Using the curried function
const curriedVolume = calculateVolumeCurried(2)(3)(4);
console.log(curriedVolume); // Output: 24

14)The match() method of String values retrieves the result of matching this string against a regular expression.
example:
const paragraph = 'The quick brown fox jumps over the lazy dog. It barked.';
const regex = /[A-Z]/g;
const found = paragraph.match(regex);

console.log(found);
// Expected output: Array ["T", "I"]

15)The parseFloat() function parses a string argument and returns a floating point number.

16)The test() method of RegExp instances executes a search with this regular expression for a match between a regular expression and a specified string. Returns true if there is a match; false otherwise.

JavaScript RegExp objects are stateful when they have the global or sticky flags set (e.g., /foo/g or /foo/y). They store a lastIndex from the previous match. Using this internally, test() can be used to iterate over multiple matches in a string of text (with capture groups).

ex:
const str = "hello world!";
const result = /^hello/.test(str);
console.log(result); // true

17)\d: This matches any single digit from 0 to 9. It's a shorthand for [0-9].
.: When inside a character set [...], the dot matches a literal period (decimal point). Outside of a character set, . is a special character that matches any single character except newline.
In the context of [\d.]+, including . along with \d allows the regular expression to match both digits and decimal points. This is particularly useful for matching numbers that might be in decimal form, such as 3.14 or 12.0.

18)The hasOwnProperty() method of Object instances returns a boolean indicating whether this object has the specified property as its own property (as opposed to inheriting it).
parameters: The String name or Symbol of the property to test.

example:
const object1 = {};
object1.property1 = 42;
console.log(object1.hasOwnProperty('property1'));
// Expected output: true

19) Element: children property
The read-only children property returns a live HTMLCollection which contains all of the child elements of the element upon which it was called.

Element.children includes only element nodes. To get all child nodes, including non-element nodes like text and comment nodes, use Node.childNodes.

Example:
const myElement = document.getElementById("foo");
for (const child of myElement.children) {
  console.log(child.tagName);
}

20)The some() method of Array instances tests whether at least one element in the array passes the test implemented by the provided function. It returns true if, in the array, it finds an element for which the provided function returns true; otherwise it returns false. It doesn't modify the array.

example:
const array = [1, 2, 3, 4, 5];

// Checks whether an element is even
const even = (element) => element % 2 === 0;

console.log(array.some(even));
// Expected output: true


21)The every() method of Array instances tests whether all elements in the array pass the test implemented by the provided function. It returns a Boolean value.
syntax:
every(callbackFn)
every(callbackFn, thisArg)


example:
const isBelowThreshold = (currentValue) => currentValue < 40;

const array1 = [1, 30, 39, 29, 10, 13];

console.log(array1.every(isBelowThreshold));
// Expected output: true
 */
