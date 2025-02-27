
document.addEventListener("DOMContentLoaded", async function () {
    const viewer = document.getElementById("panorama");
    const titleHeader = document.getElementById("title");
    const panoramaText = document.getElementById("title-panorama");
    const destinationText = document.getElementById("title-destination");
    const thumbnailContainer = document.getElementById("thumbnail-container");
    let viewerOBJ;
    // Get destination ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const destinationId = urlParams.get("destination");

    let selectedIndex = 0;
    let destinationName = "";
    let selectedItem = {
        id: "",
        name: "",
        description: "",
        categories: [],
        tags: [],
        address: "",
        thumbnail: "",
        virtual_tour: []
    };

    async function fetchDestinations() {
        try {
            // const response = await fetch("https://cms.openisland.ph/api/get-destination"); // Adjust API endpoint
            const response = await fetch("https://cms.openisland.ph/api/destinations"); // Adjust API endpoint
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    }

    async function init() {
        const destinations = await fetchDestinations();
        const foundItem = destinations.find(d => d.id == destinationId);
        // console.log(foundItem);
        destinationName = foundItem.name;
        const tours = JSON.parse(foundItem.virtual_tour);

        const scenes = {};
        const _scenes = {};

        // Loop through all tours and create scenes dynamically
        tours.forEach((tour, index) => {
            const sceneKey = `${tour.title}${index}`; // Unique key for each scene
            _scenes[index]=`${tour.path}`;
            scenes[sceneKey] = {
                "title": tour.title,
                "hfov": 110,
                "pitch": -3,
                "yaw": 117,
                "type": "equirectangular",
                "panorama": encodeURI(tour.path), // Encode URL to prevent space issues
            };
        });

        console.log(scenes);
        // Create the viewer configuration
        const viewerConfig = {
            "default": {
                "firstScene": Object.keys(scenes)[0], // Set first scene dynamically 
                "sceneFadeDuration": 1000,
                "autoLoad": true,
                "showControls": false
            },
            "scenes": scenes
        };
        selectedItem = tours;
        // Initialize Pannellum viewer with generated configuration
        
        // viewerOBJ = pannellum.viewer('panorama', viewerConfig);
        
        let url=_scenes[selectedIndex];
        const newUrl = url.slice(0, url.lastIndexOf('/'));
        console.log(newUrl);
                // embedpano({ xml: url.replace(".jpg","/vtour/")+"tour.xml", target: "panorama", passQueryParameters: "startscene,startlookat" });
                viewer.innerHTML=`<iframe type="text/html" src="`+newUrl+`/vtour/tour.html" width="100%" height="100%"></iframe>`
                titleHeader.innerText=`${destinationName} 360 - Open Island` 
        destinationText.innerText = `${destinationName}`;

        // renderThumbnails();

    }


    async function renderThumbnails() {
        thumbnailContainer.innerHTML = "";
        console.log(selectedItem);

        for (const [index, item] of selectedItem.entries()) {
            const card = document.createElement("div");
            card.classList.add("card");

            try {
                const resizedImageUrl = await resizeImage(item.path, 500, 300);
                card.style.backgroundImage = `url('${resizedImageUrl}')`;
            } catch (error) {
                console.error("Error resizing image:", error);
            }

            const title = document.createElement("div");
            title.classList.add("card-title");
            title.textContent = item.title;

            card.appendChild(title);
            card.onclick = () => {
                selectedIndex = index;
                console.log("selectedIndex", selectedIndex);
                console.log(_scenes[selectedIndex]+"tour.xml");
                let url=_scenes[selectedIndex];
                // viewer
                panoramaText.innerText = `${item.title}`;
                destinationText.innerText = `${destinationName}`;
            };

            thumbnailContainer.appendChild(card);
        }
    }


    // Allow horizontal scrolling with vertical scroll
    thumbnailContainer.addEventListener("wheel", (event) => {
        event.preventDefault();
        thumbnailContainer.scrollLeft += event.deltaY;
    });

    init();

});
function resizeImage(imageUrl, maxWidth, maxHeight) {
    return new Promise((resolve, reject) => {
        fetch(imageUrl)
            .then(response => response.blob())  // Convert image URL to Blob
            .then(blob => {
                const img = new Image();
                img.src = URL.createObjectURL(blob);
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    let width = img.width;
                    let height = img.height;

                    // Maintain aspect ratio
                    if (width > maxWidth || height > maxHeight) {
                        const aspectRatio = width / height;
                        if (width > height) {
                            width = maxWidth;
                            height = maxWidth / aspectRatio;
                        } else {
                            height = maxHeight;
                            width = maxHeight * aspectRatio;
                        }
                    }

                    // Resize image on canvas
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert canvas to Blob and create object URL
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(URL.createObjectURL(blob));
                        } else {
                            reject(new Error("Failed to resize image"));
                        }
                    }, "image/jpeg", 0.8);
                };

                img.onerror = (err) => reject(err);
            })
            .catch(error => reject(error));
    });
}
