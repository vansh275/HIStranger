const socket = io();
//  alert("client-side is working");
let localStream
let remoteStream
const configs = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
let peerConnection


socket.on('received-answer',(answer,user2)=>{
    peerConnection.setRemoteDescription(answer)
})

socket.on('received-offer',async (offer,user2)=>{
    peerConnection.setRemoteDescription(offer)

    let answer = await peerConnection.createAnswer()
    
    socket.emit('send-answer',answer,user2)
    await peerConnection.setLocalDescription(answer)
    peerConnection.addEventListener('icecandidate',event=>{
        if(event.candidate){
            //send this candidate to server to send other peer
            socket.emit('send-candidate',event.candidate,user2)
        }
    })


})


socket.on('sendOffer',async user2=>{

    peerConnection.addEventListener('icecandidate',event=>{
        if(event.candidate){
            //send this candidate to server to send other peer
            socket.emit('send-candidate',event.candidate,user2)
        }
    })

    let offer= await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    socket.emit('send-offer-to',offer,user2)

})

async function start(){
    peerConnection= new RTCPeerConnection(configs)

    stream = await navigator.mediaDevices.getUserMedia({video:true,audio:true})
    localStream= document.querySelector("#user-1")
    localStream.srcObject=stream

    stream.getTracks().forEach(track=>{
        peerConnection.addTrack(track,stream)
    })

    remoteStream= document.querySelector('#user-2')
    peerConnection.addEventListener('track', async (event) => {
        //here adding the 0th from streams to the RemoteStream.srcObject 
        remoteStream.srcObject=event.streams[0];
    })

    socket.on('received-candidate',candidate=>{
        if(candidate){
            console.log("reveiving ice ")
            peerConnection.addIceCandidate(candidate)
        }
    })

    connectBtn.disabled=true
    disconnectBtn.disabled=false
    console.log("calling whatNow ")
    socket.emit('whatNow',socket.id)
    

}

let connectBtn= document.querySelector("#connect-btn")
let disconnectBtn= document.querySelector("#disconnect-btn")
disconnectBtn.disabled=true
connectBtn.addEventListener("click",start)
disconnectBtn.addEventListener("click",disconnect)

async function connect(){
    connectBtn.disabled=true
    disconnectBtn.disabled=false
    console.log("calling whatNow ")
    socket.emit('whatNow',socket.id)
}


async function disconnect(){
    peerConnection.close()
    peerConnection = null
    // Reset any other necessary variables
    disconnectBtn.disabled=true
    connectBtn.disabled=false
}
let themeButton= document.querySelector(".theme-button")
let body=document.body
let modeText=document.querySelector('#mode')
async function toggleTheme(){ 
    body.classList.toggle('dark')
    if(modeText.textContent=='Dark'){
        modeText.textContent='Light'
    }
    else{
        modeText.textContent='Dark'
    }
    
}

themeButton.addEventListener('click',toggleTheme)
//start()
