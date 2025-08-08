const videoControls = document.getElementById('videoControls');
const videoOverlay = document.getElementById('videoOverlay');

var playing = false; 

window.electronAPI.playRandomVideo((value, main) => {
    console.log(value, main); 
    
    if (main)
    {
        console.log(value); 
        videoControls.src = value; 
        videoControls.load();
        videoControls.currentTime = 0; 
        videoOverlay.style.display = "none"; 
        return; 
    }

    if (playing)
    {
        return; 
    }

    playing = true; 

    videoOverlay.src = value;
    videoOverlay.load(); 
    videoOverlay.currentTime = 0; 
    videoOverlay.addEventListener('ended', resumeUsualVideo);
    videoOverlay.style.display = "block"; 
    videoControls.pause(); 
})

function resumeUsualVideo()
{
    playing = false; 
    videoOverlay.removeEventListener('ended', resumeUsualVideo);
    videoOverlay.style.display = "none";
    videoControls.play(); 
}