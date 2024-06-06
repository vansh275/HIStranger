const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = createServer(app);
const io = new Server(server);

class Vector {

  constructor() {
    this.data = []; // Array to store socket IDs
    this.pointer=0;
  }

  // Method to add a socket ID to the vector

  showPointer(){
    console.log('pointer is '+this.pointer);
  }
  add(socketId) {
    this.data[this.pointer]=socketId;
    this.pointer++
    this.showPointer()
  }

  swapWithLast(p) {
    if (p >= 0 && p <= this.data.length) {
      console.log('inside swap');
      this.data[p] = this.data[(this.pointer)-1]; // Replace element at index p with value at pointer
      // this.data[p]=-1
      this.pointer--; // Decrement pointer
      this.showPointer()
    } else {
      console.error("Index out of bounds");
    }
  }
  

  // Method to remove a socket ID from the vector
  remove(socketId) {
    const index = this.data.indexOf(socketId);
    if (index !== -1) {
      this.data.splice(index, 1);
    }
  }

  // Method to check if a socket ID exists in the vector
  contains(socketId) {
    return this.data.includes(socketId);
  }

  // Method to get the size of the vector
  size() {
    return this.data.length;
  }

  // Method to get all socket IDs in the vector
  getAll() {
    return this.data;
  }

  // Method to check if the vector is empty
  isEmpty() {
    return this.data.length === 0;
  }

  giveAvailUser(){
    const user=this.data[(this.pointer)-1]
    this.pointer--
    this.showPointer()
    return user
  }

  getPointer(){
    return this.pointer
  }
}

// Example usage:
const vector = new Vector();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    // res.send("<h1>hello</h1>");
    res.sendFile(join(__dirname, 'index.html'));
});

app.get('/check',(req,res)=>{
  console.log('omegle is ok');
    res.sendStatus(200);
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

    socket.on('disconnect',()=>{
      var pt=0
      console.log('inside dis ');
      const disId=socket.id
      for (let i = 0; i < vector.getPointer(); i++) {
        const socketId = vector.getAll()[i];
        console.log('socketId ' + socketId);
        console.log('disId ' + disId);
        if (socketId === disId) {
          vector.swapWithLast(pt);
        }
        pt++;
      }
      // console.log('deleted? ');
      // console.log(vector.getAll());
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
    if(!vector.getPointer()){
      console.log("pushed user "+id);
      vector.add(id)
      console.log(vector.getAll());
      // socket.emit('wait',{text:'waiting'});
      // io.to(id).emit('youWillReceiveOffer')
    }
    else{
      const user=vector.giveAvailUser()
      // vector.decrement()
      io.to(id).emit('sendOffer',user)
      console.log("seding id of this to this "+user+" "+id);
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