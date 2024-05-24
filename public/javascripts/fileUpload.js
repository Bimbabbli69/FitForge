const rootStyles = window.getComputedStyle(document.documentElement)

// Kontrollerar om variablarna är definerade och kallar på funktionen ready om de är de och om inte
// Vänta på att main css har laddats in
if (rootStyles.getPropertyValue('--musclegroup-cover-width-large') 
  && rootStyles.getPropertyValue('--musclegroup-cover-width-large') != '' ) {
  ready()
} else {
  document.getElementById('main-css').addEventListener('load', ready)
}

function ready() {
  const coverWidth = parseFloat(rootStyles.getPropertyValue('--musclegroup-cover-width-large'))
  const coverAspectRatio = parseFloat(rootStyles.getPropertyValue('--musclegroup-cover-aspect-ratio'))
  const coverHeight = coverWidth / coverAspectRatio
  FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
  )
  
  FilePond.setOptions({
    stylePanelAspectRatio: 1 / coverAspectRatio,
    imageResizeTargetWidth: coverWidth,
    imageResizeTargetHeight: coverHeight
  })

  FilePond.parse(document.body);
}

