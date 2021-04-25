let blockData = [
  { selector: '.block1', name: '1', pitch: '1' },
  { selector: '.block2', name: '2', pitch: '2' },
  { selector: '.block3', name: '3', pitch: '3' },
  { selector: '.block4', name: '4', pitch: '4' }
]

let soundSetsData = [
  { name: 'correct', sets: [1, 3, 5, 8]},
  { name: 'wrong', sets: [2, 4, 5.5, 7]},
]

let levelData = [
  '1234',
  '12324',
  '231234',
  '41233412',
  '41323134132',
  '2342341231231232',
  '41243132221234442213423',
  '331231232324441242413232124123'
]

const Blocks = function (blockAssign, setAssign) {
  this.allOn = false
  this.blocks = blockAssign.map((block, index) => {
    return {
      name: block.name,
      el: document.querySelector(block.selector),
      audio: this.getAudioObject(block.pitch),
    }
  })
  this.soundSets = setAssign.map(d => {
    return {
      name: d.name,
      sets: d.sets.map(pitch => this.getAudioObject(pitch))
    }
  })
}

Blocks.prototype.flash = function (note) {
  let block = this.blocks.find(b => b.name === note)
  if (block) {
    block.audio.currentTime = 0
    block.audio.play()
    block.el.classList.add('active')
    setTimeout(() => {
      if (!this.allOn) {
        block.el.classList.remove('active')
      }
    }, 100)
  }
}

Blocks.prototype.turnAllOn = function () {
  this.blocks.forEach(b => {
    this.allOn = true
    b.el.classList.add('active')
  })
}

Blocks.prototype.turnAllOff = function () {
  this.blocks.forEach(b => {
    this.allOn = false
    b.el.classList.remove('active')
  })
}

Blocks.prototype.getAudioObject = function (pitch) {
  const audio = new Audio('https://awiclass.monoame.com/pianosound/set/' + pitch + '.wav')
  audio.setAttribute("preload","auto")
  return audio
}

Blocks.prototype.playSet = function (type) {
  const sets = this.soundSets.find(set => set.name === type).sets
  sets.forEach(audio => {
    audio.currentTime = 0
    audio.play()
  })
}


// let blocksA = new Blocks(blockData, soundSetsData)
// 

const Game = function () {
  this.blocks = new Blocks(blockData, soundSetsData)
  this.levels = levelData
  this.currentLevel = 0
  this.playInterval = 500
  this.mode = 'waiting'
}

Game.prototype.startLevel = function () {
  this.showMsg('Level ' + this.currentLevel)
  const currentLevelData = levelData[this.currentLevel]
  this.start(currentLevelData)
}

Game.prototype.showMsg = function (msg) {
  const msgEl = document.querySelector('.status')
  msgEl.innerText = msg
}

Game.prototype.start = function (answer) {
  this.mode = 'gamePlay'
  this.answer = answer
  let notes = this.answer.split('')
  this.showMsg('Level ' + this.currentLevel)
  this.showStatus('')

  this.timer = setInterval(() => {
    const char = notes.shift()
    this.playNote(char)
    
    if (notes.length === 0) {
      
      this.startUserInput()
      clearInterval(this.timer)
    }

  }, this.playInterval)
  // this.answer = this.levels[this.currentLevel].split('')
}

Game.prototype.playNote = function (note) {
  this.blocks.flash(note)
}

Game.prototype.startUserInput = function (inputChar) {
  this.userInput = ''
  this.mode = 'userInput'
}

Game.prototype.userSendInput = function (inputChar) {
  if (this.mode !== 'userInput') return
  
  let userTempInput = this.userInput + inputChar
  this.playNote(inputChar)
  this.showStatus(userTempInput)
  
  
  if (this.answer.indexOf(userTempInput) === 0) {
    
    if (this.answer === userTempInput) {
      this.showMsg('correct')
      this.mode = 'waiting'
      this.currentLevel += 1

      setTimeout(() => {
        this.startLevel()
      }, 1000);
    }
  } else {
    this.showMsg('wrong')
    this.mode = 'waiting'
    this.currentLevel = 0


    setTimeout(() => {
      this.startLevel()
    }, 1000);

  }

  this.userInput += inputChar
}

Game.prototype.showStatus = function (tempString) {
  const inputStatus = document.querySelector('.inputStatus')
  
  inputStatus.innerHTML = ''
  const circles = this.answer.split('').map((d, i) => {
    if (i < tempString.length) {
      return `<div class="circle correct"></div>`
    } else {
      return `<div class="circle"></div>`
    }
  }).join('')
  inputStatus.innerHTML = circles

  if (tempString === '') {
    this.blocks.turnAllOff()
  }
  if (tempString === this.answer) {
    inputStatus.classList.add('correct')
    setTimeout(() => {
      this.blocks.turnAllOn()
      this.blocks.playSet('correct')
    }, 500);
  } else {
    inputStatus.classList.remove('correct')
  }

  if (this.answer.indexOf(tempString) !== 0 ) {
    inputStatus.classList.add('wrong')

    setTimeout(() => {
      this.blocks.turnAllOn()
      this.blocks.playSet('wrong')
    }, 500);
  } else {
    inputStatus.classList.remove('wrong')
  }
}
const game = new Game()


// setTimeout(() => {
//   game.startLevel()
// }, 1000);