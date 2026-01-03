let selectedGender = null;
let stream = null;
let hairTop = 20;
let hairLeft = 50;
let hairWidth = 50;

const shutter = document.getElementById('shutterSound');
const scanSound = document.getElementById('scanSound');

function setGender(gender) {
    selectedGender = gender;
    document.getElementById('btn-male').classList.remove('active');
    document.getElementById('btn-female').classList.remove('active');
    document.getElementById(`btn-${gender}`).classList.add('active');
    document.getElementById('start-btn').disabled = false;
    document.getElementById('ai-status').classList.add('status-active');
    document.getElementById('statusText').innerText = "Profile set. Ready for 360° Guided Scan.";
}

async function startScan() {
    const video = document.getElementById('webcam');
    const placeholder = document.getElementById('camera-placeholder');
    const controls = document.getElementById('scan-controls');
    const guide = document.getElementById('face-guide');

    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.style.display = "block";
        placeholder.style.display = "none";
        controls.style.display = "flex"; 
        guide.style.display = "block"; 
        document.getElementById('statusText').innerText = "Center your face in the guide.";
    } catch (err) {
        alert("Studio Error: Camera access required.");
    }
}

function captureImage() {
    const statusText = document.getElementById('statusText');
    const recommendations = document.getElementById('recommendations');
    const scanLine = document.getElementById('scanner-line');
    const guide = document.getElementById('face-guide');
    const vibe = document.getElementById('vibe-select').value;
    
    scanSound.play();
    scanLine.style.display = "block";
    guide.style.borderColor = "#6c5ce7"; 

    statusText.innerText = "Step 1: Slowly turn your head to the LEFT...";
    
    setTimeout(() => {
        statusText.innerText = "Step 2: Now slowly turn your head to the RIGHT...";
        guide.style.borderColor = "#a29bfe";
        
        setTimeout(() => {
            statusText.innerText = "Step 3: Face FORWARD and hold still...";
            guide.style.borderColor = "#00f2ff";
            
            setTimeout(() => {
                scanLine.style.display = "none";
                guide.style.display = "none";
                statusText.innerText = "Mapping Complete! Generating Matches...";
                
                setTimeout(() => {
                    const randomNum = Math.floor(Math.random() * 1000);
                    let query = `${selectedGender}-${vibe}-haircut`;
                    let webImg = `https://images.unsplash.com/featured/?${query}&sig=${randomNum}`;

                    let overlayImg = selectedGender === 'male'
                        ? "https://www.pngarts.com/files/1/Hair-PNG-Transparent-Image.png" 
                        : "https://www.pngarts.com/files/1/Hair-PNG-Image.png";

                    recommendations.innerHTML = `
                        <div class="style-card">
                            <img src="${webImg}" class="style-img-web" crossorigin="anonymous">
                            <h4 style="color:#6c5ce7">STUDIO MATCH: ${vibe.toUpperCase()}</h4>
                            <button onclick="applyOverlay('${overlayImg}')" class="btn-scan" style="width:100%; margin-top:10px;">VIRTUAL TRY-ON</button>
                        </div>
                    `;
                    document.getElementById('download-area').style.display = "block";
                }, 1500);
            }, 2000);
        }, 2500);
    }, 2500);
}

function applyOverlay(url) {
    const overlay = document.getElementById('hair-overlay');
    const adjControls = document.getElementById('adj-controls');
    
    // CRITICAL: This allows the image to be drawn on your personal photo 
    overlay.crossOrigin = "anonymous"; 
    overlay.src = url;
    overlay.style.display = "block";
    adjControls.style.display = "block";
    document.getElementById('statusText').innerText = "AR Overlay Active. Adjust for perfect fit.";
}

function adjustHair(type, value) {
    const overlay = document.getElementById('hair-overlay');
    if (type === 'top') { hairTop += value; overlay.style.top = hairTop + "%"; }
    else if (type === 'left') { hairLeft += value; overlay.style.left = hairLeft + "%"; }
    else if (type === 'width') { hairWidth += value; overlay.style.width = hairWidth + "%"; }
}

function applyFilter() {
    const val = document.getElementById('filter-slider').value;
    document.getElementById('webcam').style.filter = `brightness(${val}%) contrast(${val}%)`;
}

function tintHair() {
    const color = document.getElementById('hair-color').value;
    document.getElementById('hair-overlay').style.filter = `drop-shadow(0 0 0 ${color}) contrast(150%)`;
}

function downloadResult() {
    shutter.play();
    const video = document.getElementById('webcam');
    const hair = document.getElementById('hair-overlay');
    const canvas = document.getElementById('photo-canvas');
    const ctx = canvas.getContext('2d');

    // Match canvas to real video pixels
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 1. Draw your face (Mirrored)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0); 

    // 2. Draw hair overlay only if it is visible and loaded 
    if (hair.style.display === "block") {
        const hWidth = (hairWidth / 100) * canvas.width;
        const hHeight = (hair.naturalHeight / hair.naturalWidth) * hWidth;
        const hLeft = (hairLeft / 100) * canvas.width - (hWidth / 2);
        const hTop = (hairTop / 100) * canvas.height;
        
        ctx.drawImage(hair, hLeft, hTop, hWidth, hHeight);
    }

    // 3. Trigger Download
    const link = document.createElement('a');
    link.download = 'MyStyleSync-Dankwah.png';
    link.href = canvas.toDataURL("image/png");
    link.click();
}

function resetScan() { location.reload(); }