const { remote, app, BrowserWindow, globalShortcut, dialog, shell } = require('electron');

const path = require('node:path'); 
const fs = require('fs'); 

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 1100,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    maximizable: false
  })

  if (fs.existsSync('./videos') == false)
  {
    fs.mkdirSync('./videos');
    fs.mkdirSync('./videos/clips');
  }

  win.loadFile('index.html')

  win.removeMenu(); 

  //win.setAspectRatio(10/11); 

  win.setMinimumSize(300, 0);

  resizeWindowFromFile(win); 

  win.once('ready-to-show', () => {
    win.show()
    playMainVideo(); 
  })

  win.on('resize', async function () {
    var size = win.getSize(); 
    var width = size[0];
    var height = size[1]; 

    body = {'width': width, 'height': height}; 

    return await fs.promises.writeFile('./size.json', JSON.stringify(body)); 
  })

  async function playMainVideo()
  {
    var filePath = app.isPackaged ? path.dirname(app.getPath('exe')) + "/videos/" : __dirname + "/videos/";
    console.log(filePath); 
    const fileList = await fs.readdir(filePath, {
      withFileTypes: true
      }, async (err, files) => {
      if (err)
      {
        console.log(err); 
        return; 
      }

      var fileFound = undefined; 
      
      for (var i = 0; i < files.length; i++)
      {
        if (files[i].isFile())
        {
          fileFound = files[i].name; 
          console.log("Playing video: " + files[i].name); 
          break; 
        }
      }

      if (fileFound != undefined)
      {
        if (app.isPackaged)
        {
          win.webContents.send('play-video', path.join(path.dirname(app.getPath('exe')) + "/videos/", files[i].name), true);
        }
        else
        {
          win.webContents.send('play-video', path.join(__dirname + "/videos/", files[i].name), true);
        } 
      }
      else
      {
        const options = {
          type: 'question',
          buttons: ['Show video folder', 'Quit'],
          title: 'No video',
          message: 'There is no video in the videos folder to play.',
          detail: 'Open video folder?'
        }

        var selection = await dialog.showMessageBox(null, options); 
        
        if (selection.response == 0)
        {
          if (app.isPackaged)
          {
            shell.openPath(path.join(path.dirname(app.getPath('exe')) + '/videos')); 
          }
          else
          {
            shell.openPath(path.join(__dirname + "/videos/")); 
          }
        } 

        app.quit(); 
      }
    });
  }

  async function resizeWindowFromFile(win) {
    try {
      const winSize = await fs.promises.readFile('./size.json'); 
      var sizeFound = JSON.parse(winSize); 
      win.setSize(sizeFound.width, sizeFound.height); 
    } catch (err) {
      console.log("No pre-set size"); 
    }
  }

  async function playRandomVideo() {
    //get random number from 0 to length of videos
    var length = 0; 
    var f = undefined; 

    const fileList = await fs.readdir('./videos/clips', async (err, files) => {
        if (err)
        {
          console.log(err);
        }
        else
        {
            length = files.length; 

            var filePath = app.isPackaged ? path.join(path.dirname(app.getPath('exe')) + '/videos/clips/') : path.join(__dirname + "/videos/clips/");

            if (length == 0)
            {
              const options = {
                type: 'question',
                buttons: ['Show clips folder', 'Cancel'],
                title: 'No videos in clips',
                message: 'There are no videos in videos/clips to play.',
                detail: 'Open clips folder?'
              }

              var selection = await dialog.showMessageBox(null, options); 
              if (selection.response == 0)
              {
                if (app.isPackaged)
                {
                  shell.openPath(path.join(path.dirname(app.getPath('exe')) + '/videos/clips')); 
                }
                else
                {
                  shell.openPath(path.join(__dirname + "/videos/clips")); 
                }
              }
              else
              {
                console.log("Cancelled"); 
              }
              return; 
            }

            var index = Math.floor(Math.random()*length); 
            console.log(files); 
            console.log(files[index]); 

            win.webContents.send('play-video', filePath + files[index], false); 
        }
    })   
  }

  return {win, playRandomVideo, playMainVideo }
}

app.whenReady().then(() => {
    const {playMainVideo, playRandomVideo } = createWindow();
    globalShortcut.register('F7', () => {
        console.log("Global shortcut triggered");
        playRandomVideo(); 
     })
    // globalShortcut.register('F8', () => {
    //   playMainVideo(); 
    // })
});

