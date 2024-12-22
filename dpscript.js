class Test {
    constructor(cursor,inputBox,wordArray,word,character,correct,incorrect,wordContainer) {
        // word is css word class
        this.cursor = cursor;
        this.inputBox = inputBox;
        this.wordPtr = 0;
        this.wordArray = wordArray;
        this.userWordArray = new Array(wordArray.length).fill('');
        this.backSpacePtr = 0;
        this.word = word;
        this.character = character;
        this.correct = correct;
        this.incorrect = incorrect;
        this.wordContainer = wordContainer;
        this.inputs = {
            " " : new Space(this),
            "Backspace" : new Backspace(this),
            "Ctrl+Backspace" : new CtrlBackspace(this),
            "Character" : new Character(this)
        }; // don't know will it work or not 
    }

    endTest() {
        // TODO : this method disable inputBox & redirect or show stats of test.
        this.inputBox.disabled = true;
    }

    getCurrentWord() {
        return document.querySelector(`.${this.word}:nth-child(${this.wordPtr+1})`);
    }

    isTestCompleted() {
        return this.wordPtr >= this.wordArray.length;
    }
    renderCurrentWord() {
        const word = this.getCurrentWord();

        const userWord = this.userWordArray[this.wordPtr];
        const correctWord = this.wordArray[this.wordPtr];


        word.innerHTML = '';
        for(let i = 0; i < Math.min(userWord.length,correctWord.length); i++) {
            const letter = document.createElement('div');
            letter.classList.add(this.character);
            letter.textContent = correctWord[i];

            if(correctWord[i] === userWord[i]) 
                letter.classList.add(this.correct);
            else 
                letter.classList.add(this.incorrect);
            word.appendChild(letter);
        }

        if(correctWord.length > userWord.length) {
            this.cursor.updateCursor(word);
            for(let i = userWord.length; i < correctWord.length; i++) {
                const letter = document.createElement('div');
                letter.classList.add(this.character);
                letter.textContent = correctWord[i];
                word.appendChild(letter);
            }
        }else {
            for(let i = correctWord.length; i < userWord.length; i++) {
                const letter = document.createElement('div');
                letter.classList.add(this.character);
                letter.textContent = userWord[i];
                letter.classList.add(this.incorrect);
                word.appendChild(letter);
            }
            this.cursor.updateCursor(word);
        }
    }
    isWordCorrect(user,original) {
        return user === original;
    }
    handleInput(event) {
        const key = this.eventAdapter(event);
        if(key === "InValidKey") return;
        this.inputs[key].action(event);
    }
    eventAdapter(event) {
        if(event.ctrlKey && event.key === 'Backspace') 
            return "Ctrl+Backspace";
        else if(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]$/.test(event.key)) 
            return "Character";
        else if(event.key == ' ' | event.key == 'Backspace') return event.key;
        else return "InValidKey";
    }
    loadTest() {
        const container = document.getElementById(this.wordContainer);
        container.innerHTML = '';


        container.addEventListener('click', () => {
            this.inputBox.focus();
        })

        this.inputBox.focus();


        for(let index = 0; index < this.wordArray.length; index++) {
            let word = wordArray[index];
            const wordDiv = document.createElement('div');
            wordDiv.classList.add(this.word);

            for(let j = 0; j < word.length; j++) {
                if(index === 0 && j === 0) this.cursor.updateCursor(wordDiv);
                let character = word[j];
                const characterDiv = document.createElement('div');
                characterDiv.classList.add(this.character);
                characterDiv.textContent = character;
                wordDiv.appendChild(characterDiv);
            }
            container.append(wordDiv);
        }
    }
}

class Input {
    action(event) {
        throw new Error("Implement this shit.");
    }
}

class Space extends Input {
    constructor(test) {
        super();
        this.test = test;
    }
    action(event) {
        event.preventDefault();
        if(this.test.isTestCompleted()) return;
        if(this.test.userWordArray[this.test.wordPtr].length === 0) return;

        this.test.inputBox.value = '';

        const user = this.test.userWordArray[this.test.wordPtr];
        const original = this.test.wordArray[this.test.wordPtr];

        if(this.test.isWordCorrect(user,original)) {
            this.test.backSpacePtr = this.test.wordPtr+1;
        }   
        
        const oldWord = this.test.getCurrentWord();
        this.test.cursor.removeCursor(oldWord);

        this.test.wordPtr++;
        this.test.cursor.cursorPtr = 0;
        
        if(this.test.isTestCompleted()) 
            this.test.endTest();
        else {
            const newWord = this.test.getCurrentWord();
            this.test.cursor.insertNewCursor(newWord);
        }
    }
}

class Backspace extends Input {
    constructor(test) {
        super();
        this.test = test;
    }
    action(event) {
        if(this.test.isTestCompleted()) return;

        if(this.test.userWordArray[this.test.wordPtr].length != 0) {
            this.test.userWordArray[this.test.wordPtr] = this.test.userWordArray[this.test.wordPtr].slice(0,-1);
            this.test.cursor.cursorPtr--;
        }else if(this.test.wordPtr > this.test.backSpacePtr) {
            const word = this.test.getCurrentWord();
            this.test.cursor.removeCursor(word);
            this.test.wordPtr--;
            this.test.cursor.cursorPtr = this.test.userWordArray[this.test.wordPtr].length;
            this.test.inputBox.value = this.test.userWordArray[this.test.wordPtr];
            event.preventDefault();
        }else return;

        this.test.renderCurrentWord();
    }
}

class Character extends Input {
    constructor(test) {
        super();
        this.test = test;
    }
    action(event) {
        if(this.test.isTestCompleted()) return;
        this.test.userWordArray[this.test.wordPtr] += event.key;
        this.test.cursor.cursorPtr++;
        this.test.renderCurrentWord();
        if(this.test.wordPtr === this.test.wordArray.length-1) {
            if(this.test.isWordCorrect(this.test.userWordArray[this.test.wordPtr],this.test.wordArray[this.test.wordPtr])) {
                this.test.endTest();
            }
        }
    }
}

class CtrlBackspace extends Input {
    constructor(test) {
        super();
        this.test = test;
    }
    action(event) {
        if(this.test.isTestCompleted()) return;

        if(this.test.userWordArray[this.test.wordPtr].length != 0) {
            this.test.userWordArray[this.test.wordPtr] = '';
            this.test.inputBox.value = '';
            this.test.cursor.cursorPtr = 0;
        }else if(this.test.wordPtr > this.test.backSpacePtr) {
            const word = this.test.getCurrentWord();
            this.test.cursor.removeCursor(word);
            this.test.wordPtr--;
            this.test.cursor.cursorPtr = 0;
            this.test.userWordArray[this.test.wordPtr] = '';
            this.test.inputBox.value = '';
            event.preventDefault();
        }else return;

        this.test.renderCurrentWord();
    }
}

class Cursor {
    constructor(cursorPtr,cursorClass) {
        this.cursorPtr=cursorPtr;
        this.cursorClass = cursorClass;
    }
    updateCursor(word) {
        const cursor = document.createElement('div');
        cursor.classList.add(this.cursorClass);
        word.appendChild(cursor);
    }
    removeCursor(word) {
        word.removeChild(word.querySelector(`.${this.cursorClass}`));
    }
    insertNewCursor(word) {
        const cursor = document.createElement('div');
        cursor.classList.add(this.cursorClass);
        word.insertBefore(cursor,word.firstChild);
    }
}

const originalText = "Old man... everyone... and you, Luffy... Even though I’ve been good for nothing my whole life... Even though I carry the blood of a demon within me... You still loved me. Thank you so much.";
const wordArray = originalText.split(' ');
const typingTest = new Test(new Cursor(0,'cursor'),document.getElementById('textInputBox'),wordArray,'word','character','correct','incorrect','wordContainer');

function runApp() {
    typingTest.inputBox.addEventListener('keydown',event => {
        typingTest.handleInput(event);
    });
}

typingTest.loadTest();
runApp();