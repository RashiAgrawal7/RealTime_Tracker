const socket = io();

const userName = prompt("Enter your name: ");

if(navigator.geolocation){
    navigator.geolocation.watchPosition((position)=>{
        const {latitude,longitude} = position.coords;
        socket.emit("send-location",{latitude,longitude,name: userName});
    },
    (error)=>{
        console.error(error);
    },
    {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
    }
)
}

const map = L.map("map").setView([0,0],16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution:"Rashi"
}).addTo(map)

let myId;
socket.on("connect", () => {
    myId = socket.id;
});

const markers = {};

socket.on("recieve-location", (data)=>{
    const {id,latitude,longitude,name} = data;
    if (id === myId) {
        map.setView([latitude, longitude]);
    }
    if(markers[id]){
        markers[id].setLatLng([latitude,longitude]);
        markers[id].getPopup().setContent(name);
    }
    else{
        markers[id] = L.marker([latitude,longitude]).addTo(map).bindPopup(name);;
    }

})

socket.on("existing-locations", (users) => {
    for (let id in users) {
        const { latitude, longitude, name } = users[id];
        if (!markers[id]) {
            markers[id] = L.marker([latitude, longitude]).addTo(map).bindPopup(name);;
        }
    }
});

socket.on("user-disconnected", (id)=>{
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];
    }
})


