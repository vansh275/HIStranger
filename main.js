const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = createServer(app);
const io = new Server(server);

//  STACK IMPLEMENTATION 
class Stack {
  constructor() {
    this.items = [];
  }

  push(element) {
    this.items.push(element);
  }

  pop() {
    if (this.isEmpty()) {
      return "Underflow";
    }
    return this.items.pop();
  }

  peek() {
    return !this.isEmpty() ? this.items[this.items.length - 1] : "No elements in Stack";
  }

  isEmpty() {
    return this.items.length === 0;
  }

  printStack() {
    let str = "";
    for (let i = 0; i < this.items.length; i++)
      str += this.items[i] + " ";
    return str;
  }
}
//Making Stack for socketid where users stay and wait for connection 
const users= new Stack();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    // res.send("<h1>hello</h1>");
    res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected')
  //Listening for offer 
  socket.on('offer',(offer)=>{
    console.log("got offer ");
    console.log(offer)
  })
  //listening for ice candidate
  socket.on('candidate',(candidate)=>{
    console.log("got candidate")
    console.log(candidate);
  })

  //checking for stack empty
  // socket.on('id',(id,offer)=>{
  //   console.log("server side for id call "+ id);
  //   if(users.isEmpty()){
  //     console.log("pushing user ");
  //     users.push(id)
  //   }
  //   else{
  //     const peer2Id=users.pop()
  //     console.log("sending offer to peer2Id "+peer2Id);
  //     io.to(peer2Id).emit('offer',offer,id)
  //   }
  // })
  socket.on('whatNow',id=>{
    if(users.isEmpty()){
      console.log("pushed user "+id);
      users.push(id)
      // io.to(id).emit('youWillReceiveOffer')
    }
    else{
      let toUser=users.pop()
      console.log("seding id of this to this "+toUser+" "+id);
      io.to(id).emit('sendOffer',toUser)
    }
  })


  socket.on('send-offer-to',(offer,toUser)=>{
    console.log("sending offer to "+toUser);
    io.to(toUser).emit('received-offer',offer,socket.id)
  })

  socket.on('send-candidate',(candidate,toUser)=>{
    console.log("sending ice to "+toUser);
    io.to(toUser).emit('received-candidate',candidate)
  })

  socket.on('send-answer',(answer,toUser)=>{
    console.log("sending answer to "+toUser);
    io.to(toUser).emit('received-answer',answer,socket.id)
  })
});

server.listen(3000,()=>{
  console.log('server running at http://localhost:3000');
  
})