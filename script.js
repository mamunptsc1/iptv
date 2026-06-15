/* CLOCK */

function updateClock() {

const now = new Date();

const days = [
'রবিবার',
'সোমবার',
'মঙ্গলবার',
'বুধবার',
'বৃহস্পতিবার',
'শুক্রবার',
'শনিবার'
];

const months = [
'জানুয়ারি',
'ফেব্রুয়ারি',
'মার্চ',
'এপ্রিল',
'মে',
'জুন',
'জুলাই',
'আগস্ট',
'সেপ্টেম্বর',
'অক্টোবর',
'নভেম্বর',
'ডিসেম্বর'
];

const bdTime = new Date(
now.toLocaleString(
'en-US',
{ timeZone: 'Asia/Dhaka' }
)
);

let hour = bdTime.getHours();

const minute = String(
bdTime.getMinutes()
).padStart(2, '0');

const second = String(
bdTime.getSeconds()
).padStart(2, '0');

const ampm =
hour >= 12 ? 'PM' : 'AM';

hour = hour % 12;

hour = hour ? hour : 12;

document.getElementById('clock').innerHTML =
`${days[bdTime.getDay()]}, ${bdTime.getDate()} ${months[bdTime.getMonth()]} ${bdTime.getFullYear()}, ${hour}:${minute}:${second} ${ampm}`;

}

setInterval(updateClock, 1000);

updateClock();

/* LOAD CHANNELS */

fetch("bangla.json")

.then(res => res.json())

.then(data => {

let mergedChannels = [];

/* CATEGORY JSON SUPPORT */

if (data.categories) {

mergedChannels =
Object.values(data.categories).flat();

} else {

mergedChannels = data;

}

/* REMOVE DUPLICATE */

const uniqueChannels = [];

const seen = new Set();

mergedChannels.forEach(ch => {

const key =
((ch.name || '') +
(ch.url || ''))
.toLowerCase()
.trim();

if (!seen.has(key)) {

seen.add(key);

uniqueChannels.push({

name: ch.name || 'Unknown',

url: ch.url || '',

logo:
ch.logo ||
'https://i.ibb.co/3k5p1t4/live-icon.png',

category:
ch.group ||
ch.category ||
'Ungrouped'

});

}

});

window.allChannels = uniqueChannels;

/* LOAD UI */

loadChannels(uniqueChannels);

/* TOTAL COUNT */

const count =
document.getElementById('allCount');

if(count){

count.innerText =
uniqueChannels.length;

}

/* AUTO PLAY */

const saved =
localStorage.getItem(
'lastChannel'
);

if(saved){

setTimeout(() => {

playChannel(saved);

}, 1000);

}

})

.catch(err => {

console.error(
'CHANNEL LOAD ERROR:',
err
);

});

/* SHOW CHANNELS */

async function loadChannels(channels) {

let html = '';

for (const ch of channels) {

html += `

<div class="card"
onclick="playChannel('${ch.url}',this)">

<img
src="${ch.logo}"
onerror="this.src='https://i.ibb.co/3k5p1t4/live-icon.png'">

<h3>${ch.name}</h3>

</div>

`;

}

document.getElementById(
'channels'
).innerHTML = html;

}

/* CATEGORY */

function filterCategory(type, el) {

document
.querySelectorAll('.category-btn')
.forEach(btn => {

btn.classList.remove('active');

});

if(el){
el.classList.add('active');
}

let filtered = [];

if (type === 'all') {

filtered = window.allChannels;

} else {

filtered =
window.allChannels.filter(ch =>

(ch.category || '')
.toLowerCase()
.includes(type.toLowerCase())

);

}

loadChannels(filtered);

}

/* SEARCH */

document
.getElementById('search')
.addEventListener(
'keyup',
function () {

const value =
this.value.toLowerCase();

const filtered =
window.allChannels.filter(ch =>

(ch.name || '')
.toLowerCase()
.includes(value)

);

loadChannels(filtered);

}
);

/* PLAYER */

function playChannel(url, card) {

localStorage.setItem(
'lastChannel',
url
);

document.getElementById(
'loader'
).style.display = 'block';

document
.querySelectorAll('.card')
.forEach(c => {

c.classList.remove('active');

});

if (card) {

card.classList.add('active');

}

const video =
document.getElementById('video');

video.onerror = function () {

document.getElementById(
'loader'
).style.display = 'none';

alert('Channel not working');

};

/* MP4 */

if (url.includes('.mp4')) {

video.src = url;

video.play()
.then(() => {

document.getElementById(
'loader'
).style.display = 'none';

});

return;

}

/* HLS */

if (Hls.isSupported()) {

if (window.hls) {

window.hls.destroy();

}

const hls = new Hls({

enableWorker: true,

lowLatencyMode: true

});

window.hls = hls;

hls.loadSource(url);

hls.attachMedia(video);

hls.on(
Hls.Events.MANIFEST_PARSED,
function () {

video.play()
.then(() => {

document.getElementById(
'loader'
).style.display = 'none';

});

}
);

} else {

/* Native HLS */

video.src = url;

video.play()
.then(() => {

document.getElementById(
'loader'
).style.display = 'none';

});

}

}

/* REMOTE CONTROL */

let currentIndex = 0;

document.addEventListener(
'keydown',
function (e) {

const video =
document.getElementById('video');

if (e.key === 'ArrowDown') {

e.preventDefault();

if (
currentIndex <
window.allChannels.length - 1
) {

currentIndex++;

const ch =
window.allChannels[currentIndex];

playChannel(
ch.url,
document.querySelectorAll('.card')[currentIndex]
);

}

}

if (e.key === 'ArrowUp') {

e.preventDefault();

if (currentIndex > 0) {

currentIndex--;

const ch =
window.allChannels[currentIndex];

playChannel(
ch.url,
document.querySelectorAll('.card')[currentIndex]
);

}

}

if (e.key === 'ArrowRight') {

if (video.volume < 1) {

video.volume += 0.1;

}

}

if (e.key === 'ArrowLeft') {

if (video.volume > 0) {

video.volume -= 0.1;

}

}

}
);
