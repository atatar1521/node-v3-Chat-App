
const socket = io()

//Elements
const $messageForm = document.querySelector('#messageForm')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username,room} = Qs.parse(location.search,{ ignoreQueryPrefix:true})

const autoScroll = ()=>{
  //New message element
  const $newMessage = $messages.lastElementChild

  //Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
 
  //Visible height
  const visibleHeight = $messages.offsetHeight

  //Height of messages container
  const containerHeight = $messages.scrollHeight
  
  //How far have i scrolled 
  const scrollOffest = $messages.scrollTop + visibleHeight

  if(containerHeight - newMessageHeight <= scrollOffest){
    $messages.scrollTop = $messages.scrollHeight
  }

}

socket.on('message',(message)=>{
     console.log( message)
     const html = Mustache.render(messageTemplate,{
        username : message.username, 
         message : message.text,
         createdAt : moment(message.createdAt).format('hh:mm a')
     })
     $messages.insertAdjacentHTML('beforeend',html)
     autoScroll()    
})

 socket.on('locationMessage',(message)=>{
    console.log( message)
     const html = Mustache.render(locationTemplate,{
        username : message.username,
        locationUrl: message.url,
        createdAt : moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()    

})

socket.on('roomData',({room , users})=>{
   const html = Mustache.render(sidebarTemplate,{
       room,
       users
   })
   document.querySelector('#sidebar').innerHTML = html
})

 $messageForm.addEventListener('submit',(e)=>{
   e.preventDefault()
   
   $messageFormButton.setAttribute('disabled','disabled')
   
   const message = e.target.elements.message.value

   socket.emit('sendMessage',message,(error)=>{
    $messageFormButton.removeAttribute('disabled') 
    $messageFormInput.value = ''
    $messageFormInput.focus()
   
    if(error){
       return console.log(error)
     }
     else{
       console.log('Message delivered')
     }
   })

 })

 $sendLocationButton.addEventListener('click',()=>{
     
    if(!navigator.geolocation){
         return alert('Geolocation is not supported by your browser')
     }
     
     $sendLocationButton.setAttribute('disabled','disabled')

     navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
           latitude: position.coords.latitude,
           longitude: position.coords.longitude
       },()=>{
        $sendLocationButton.removeAttribute('disabled') 
         console.log('Location Shared')
       })

     })
 })

 socket.emit('join',{username,room},(error)=>{
     if(error){
         alert(error)
         location.href = '/'
     }
 })